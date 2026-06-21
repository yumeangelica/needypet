const { describe, it, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const mailer = require('../utils/mailer');
const { api, registerAndLogin } = require('./helpers');

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
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
  it('deletes the account and returns 204', async () => {
    const { token, id } = await registerAndLogin();

    const response = await api
      .delete(`/auth/users/${id}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 204);

    const deleted = await User.findById(id);
    assert.strictEqual(deleted, null);
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
  // requestPasswordReset only issues a token when the user can resend a
  // verification email, which is true once the email has been confirmed.
  const confirmEmail = async (email) => {
    const user = await User.findOne({ email });
    user.emailConfirmed = true;
    user.emailConfirmToken = null;
    user.emailConfirmTokenExpires = null;
    await user.save();
  };

  it('runs the full request -> verify -> reset flow', async () => {
    const { email, userName } = await registerAndLogin();
    await confirmEmail(email);

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

  it('returns 401 when verifying an invalid reset token', async () => {
    const { email } = await registerAndLogin();
    await confirmEmail(email);

    const response = await api
      .post('/auth/verify-password-reset-token')
      .send({ email, token: 'invalid-token' });

    assert.strictEqual(response.status, 401);
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
