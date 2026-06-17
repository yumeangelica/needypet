const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');

const api = supertest(app);

const newUserObject = {
  userName: 'toggleUser',
  email: 'toggle@example.com',
  newPassword: 'togglePass123!',
  timezone: 'Europe/Helsinki',
};

const credentials = {
  userName: 'toggleUser',
  password: 'togglePass123!',
};

// Creates a user, logs in and returns the auth token.
const registerAndLogin = async () => {
  await api.post('/auth/users').send(newUserObject);
  const loginResponse = await api.post('/auth/login').send(credentials);
  return loginResponse.body.token;
};

// Creates a pet with a single duration need and returns { petId, needId }.
const createPetWithNeed = async token => {
  const petResponse = await api
    .post('/api/pets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Milo', species: 'Cat', breed: 'Tabby' });

  const petId = petResponse.body.id;

  const needResponse = await api
    .post(`/api/pets/${petId}/newneed`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      need: {
        category: 'Walk',
        description: 'Morning walk',
        dateFor: '2026-06-17',
        duration: { value: 40, unit: 'minutes' },
      },
    });

  const needList = needResponse.body.needs;
  const needId = needList[needList.length - 1].id;

  return { petId, needId };
};

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await mongoose.connection.close();
});

describe('Need activity toggle', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});
  });

  it('allows the PATCH method in the CORS preflight response', async () => {
    const response = await api
      .options('/api/pets/x/needs/y/togglestatus')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'PATCH');

    assert.ok([200, 204].includes(response.status), `unexpected status ${response.status}`);
    const allowMethods = response.headers['access-control-allow-methods'] || '';
    assert.match(allowMethods, /PATCH/, 'Allow-Methods should include PATCH');
  });

  it('toggles a need isActive flag from true to false and back', async () => {
    const token = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token);

    const firstToggle = await api
      .patch(`/api/pets/${petId}/needs/${needId}/togglestatus`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(firstToggle.status, 200);
    const needAfterFirst = firstToggle.body.needs.find(need => need.id === needId);
    assert.strictEqual(needAfterFirst.isActive, false);

    const secondToggle = await api
      .patch(`/api/pets/${petId}/needs/${needId}/togglestatus`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(secondToggle.status, 200);
    const needAfterSecond = secondToggle.body.needs.find(need => need.id === needId);
    assert.strictEqual(needAfterSecond.isActive, true);
  });

  it('returns 404 when toggling an unknown need', async () => {
    const token = await registerAndLogin();
    const { petId } = await createPetWithNeed(token);
    const unknownNeedId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .patch(`/api/pets/${petId}/needs/${unknownNeedId}/togglestatus`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 404);
  });
});
