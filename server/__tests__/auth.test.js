const { describe, it, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const mailer = require('../utils/mailer');
const { api, registerAndLogin, createPet } = require('./helpers');

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  // Email is sent during registration; stub it so tests never hit SMTP.
  mock.method(mailer, 'sendConfirmationEmail', () => Promise.resolve());
  mock.method(mailer, 'sendPasswordResetEmail', () => Promise.resolve());
});

describe('POST /auth/login', () => {
  it('returns a token and user on valid credentials', async () => {
    const { userName, password } = await registerAndLogin();

    const response = await api.post('/auth/login').send({ userName, password });

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.token, 'should return a token');
    assert.strictEqual(response.body.user.userName, userName);
  });

  it('returns 401 on a wrong password', async () => {
    const { userName } = await registerAndLogin();

    const response = await api
      .post('/auth/login')
      .send({ userName, password: 'WrongPass123!' });

    assert.strictEqual(response.status, 401);
  });

  it('returns 401 for a non-existent user', async () => {
    const response = await api
      .post('/auth/login')
      .send({ userName: 'ghostUser', password: 'WhateverPass123!' });

    assert.strictEqual(response.status, 401);
  });
});

describe('POST /auth/users (duplicates)', () => {
  it('returns 400 when the userName already exists', async () => {
    await registerAndLogin();

    const response = await api.post('/auth/users').send({
      userName: 'testUser',
      email: 'different@example.com',
      newPassword: 'TestPass123!',
      timezone: 'Europe/Helsinki',
    });

    assert.strictEqual(response.status, 400);
  });

  it('returns 400 when the email already exists', async () => {
    await registerAndLogin();

    const response = await api.post('/auth/users').send({
      userName: 'differentUser',
      email: 'test@example.com',
      newPassword: 'TestPass123!',
      timezone: 'Europe/Helsinki',
    });

    assert.strictEqual(response.status, 400);
  });

  it('does not expose sensitive fields in the response body', async () => {
    const response = await api.post('/auth/users').send({
      userName: 'safeUser',
      email: 'safe@example.com',
      newPassword: 'TestPass123!',
      timezone: 'Europe/Helsinki',
    });

    assert.strictEqual(response.status, 201);
    // Security-sensitive fields must never be serialized in API responses.
    assert.strictEqual(response.body.passwordHash, undefined);
    assert.strictEqual(response.body.emailConfirmToken, undefined);
    assert.strictEqual(response.body.emailConfirmTokenExpires, undefined);
    assert.strictEqual(response.body.passwordResetToken, undefined);
    assert.strictEqual(response.body.passwordResetExpires, undefined);
  });

  it('returns password strength errors in the standard array shape', async () => {
    const response = await api.post('/auth/users').send({
      userName: 'weakUser',
      email: 'weak@example.com',
      newPassword: 'weak',
      timezone: 'Europe/Helsinki',
    });

    assert.strictEqual(response.status, 422);
    assert.ok(Array.isArray(response.body.errorDetails?.newPassword));
    assert.match(response.body.errorDetails.newPassword[0], /password/i);
  });
});

describe('GET /auth/users/:id', () => {
  it('returns the user for a valid token and id', async () => {
    const { token, id, userName } = await registerAndLogin();

    const response = await api
      .get(`/auth/users/${id}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.userName, userName);
    assert.strictEqual(response.body.passwordHash, undefined);
  });

  it('returns 401 without a token', async () => {
    const { id } = await registerAndLogin();
    const response = await api.get(`/auth/users/${id}`);
    assert.strictEqual(response.status, 401);
  });
});

describe('DELETE /auth/users/:id', () => {
  it('deletes the account and owned pets, then returns 204', async () => {
    const { token, id } = await registerAndLogin();
    const pet = await createPet(token);

    const response = await api
      .delete(`/auth/users/${id}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 204);

    const deleted = await User.findById(id);
    assert.strictEqual(deleted, null);

    const deletedPet = await Pet.findById(pet.id);
    assert.strictEqual(deletedPet, null);
  });

  it('keeps pets owned by another user when deleting a caretaker account', async () => {
    const owner = await registerAndLogin();
    const caretaker = await registerAndLogin({
      userName: 'caretakerUser',
      email: 'caretaker@example.com',
    });
    const pet = await createPet(owner.token);

    await api
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ careTakers: [caretaker.id] });

    const response = await api
      .delete(`/auth/users/${caretaker.id}`)
      .set('Authorization', `Bearer ${caretaker.token}`);

    assert.strictEqual(response.status, 204);

    const deletedCaretaker = await User.findById(caretaker.id);
    assert.strictEqual(deletedCaretaker, null);

    const ownerPet = await Pet.findById(pet.id);
    assert.ok(ownerPet, 'pet owned by another user should not be deleted');
    assert.strictEqual(ownerPet.owner.toString(), owner.id);
    assert.deepStrictEqual(
      ownerPet.careTakers.map((careTaker) => careTaker.toString()),
      [],
    );
  });
});

describe('POST /auth/validatetoken', () => {
  it('accepts a valid token', async () => {
    const { token } = await registerAndLogin();

    const response = await api
      .post('/auth/validatetoken')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.token, token);
  });

  it('returns 401 when the token is missing', async () => {
    const response = await api.post('/auth/validatetoken');
    assert.strictEqual(response.status, 401);
  });
});

describe('Email confirmation flow', () => {
  it('confirms the email with a valid token', async () => {
    const { email } = await registerAndLogin();

    // The confirmation token is generated server-side at registration.
    const user = await User.findOne({ email });
    const token = user.emailConfirmToken;
    assert.ok(token, 'a confirmation token should exist after registration');

    const response = await api
      .post('/auth/verify-email-confirmation-token')
      .send({ email, token });

    assert.strictEqual(response.status, 200);

    const confirmed = await User.findOne({ email });
    assert.strictEqual(confirmed.emailConfirmed, true);
    assert.strictEqual(confirmed.emailConfirmToken, null);
  });

  it('returns 401 for an invalid confirmation token', async () => {
    const { email } = await registerAndLogin();

    const response = await api
      .post('/auth/verify-email-confirmation-token')
      .send({ email, token: 'not-a-real-token' });

    assert.strictEqual(response.status, 401);
  });
});

describe('Password reset flow', () => {
  it('issues a reset token even when the email is still unconfirmed', async () => {
    // requestPasswordReset gates on canResendPasswordReset(), which inspects the
    // password reset token — not the email confirmation token. A freshly
    // registered (unconfirmed) user with no pending reset token should still get one.
    const { email } = await registerAndLogin();

    const response = await api
      .post('/auth/request-password-reset')
      .send({ email });
    assert.strictEqual(response.status, 200);

    const user = await User.findOne({ email });
    assert.ok(
      user.passwordResetToken,
      'a reset token should be issued without confirming the email first',
    );
  });

  it('runs the full request -> verify -> reset flow', async () => {
    const { email, userName } = await registerAndLogin();

    // 1. Request reset — server generates and stores a token.
    const requestResponse = await api
      .post('/auth/request-password-reset')
      .send({ email });
    assert.strictEqual(requestResponse.status, 200);

    const user = await User.findOne({ email });
    const token = user.passwordResetToken;
    assert.ok(token, 'a reset token should be generated');

    // 2. Verify the token.
    const verifyResponse = await api
      .post('/auth/verify-password-reset-token')
      .send({ email, token });
    assert.strictEqual(verifyResponse.status, 200);

    // 3. Reset the password.
    const newPassword = 'BrandNewPass456!';
    const resetResponse = await api
      .post('/auth/password-reset')
      .send({ email, token, newPassword });
    assert.strictEqual(resetResponse.status, 200);

    // The new password should now work for login, and the token is cleared.
    const loginResponse = await api
      .post('/auth/login')
      .send({ userName, password: newPassword });
    assert.strictEqual(loginResponse.status, 200);

    const afterReset = await User.findOne({ email });
    assert.strictEqual(afterReset.passwordResetToken, null);
  });

  it('returns 200 without revealing whether the email exists', async () => {
    const response = await api
      .post('/auth/request-password-reset')
      .send({ email: 'nobody@example.com' });

    // Generic 200 to avoid account enumeration.
    assert.strictEqual(response.status, 200);
  });

  it('rejects a weak new password with 422 and keeps the token', async () => {
    const { email } = await registerAndLogin();

    await api.post('/auth/request-password-reset').send({ email });
    const token = (await User.findOne({ email })).passwordResetToken;

    const response = await api
      .post('/auth/password-reset')
      .send({ email, token, newPassword: 'weak' });

    assert.strictEqual(response.status, 422);
    // The client reads errorDetails.newPassword[0], so it must be a non-empty
    // array carrying the strength message.
    assert.ok(
      Array.isArray(response.body.errorDetails?.newPassword),
      'newPassword errors should be an array',
    );
    assert.match(
      response.body.errorDetails.newPassword[0],
      /strength|10 char/i,
    );

    // The token must not be consumed when the reset is rejected.
    const afterReject = await User.findOne({ email });
    assert.strictEqual(afterReject.passwordResetToken, token);
  });

  it('returns 401 when verifying an invalid reset token', async () => {
    const { email } = await registerAndLogin();

    const response = await api
      .post('/auth/verify-password-reset-token')
      .send({ email, token: 'invalid-token' });

    assert.strictEqual(response.status, 401);
  });

  it('does not issue a new token while an unexpired reset token already exists', async () => {
    const { email } = await registerAndLogin();

    // First request issues a token.
    await api.post('/auth/request-password-reset').send({ email });
    const firstToken = (await User.findOne({ email })).passwordResetToken;
    assert.ok(
      firstToken,
      'a reset token should be issued on the first request',
    );

    // Second request while the first token is still valid must not replace it
    // (canResendPasswordReset() returns false), so reset links stay throttled.
    const secondResponse = await api
      .post('/auth/request-password-reset')
      .send({ email });
    assert.strictEqual(secondResponse.status, 200);

    const secondToken = (await User.findOne({ email })).passwordResetToken;
    assert.strictEqual(
      secondToken,
      firstToken,
      'the existing reset token should be left unchanged',
    );
  });
});

describe('POST /auth/resend-email-confirmation', () => {
  it('returns 400 right after registration (token still valid)', async () => {
    const { token } = await registerAndLogin();

    // canResendVerificationEmail() is false while the confirm token is unexpired.
    const response = await api
      .post('/auth/resend-email-confirmation')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 400);
  });
});
