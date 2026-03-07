const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('API Tests', () => {
  let newUserObject;
  let credentials;

  beforeEach(async () => {
    await User.deleteMany({});

    newUserObject = {
      userName: 'testUser123',
      email: 'test@example.com',
      newPassword: 'testPass123!',
      timezone: 'Europe/Helsinki',
    };

    credentials = {
      userName: 'testUser123',
      password: 'testPass123!',
    };
  });

  it('successfully creates a new user', async () => {
    const response = await supertest(app)
      .post('/auth/users')
      .send(newUserObject);

    assert.strictEqual(response.status, 201);
  });

  it('allows a user to log in and returns a token', async () => {
    await supertest(app)
      .post('/auth/users')
      .send(newUserObject);

    const response = await supertest(app)
      .post('/auth/login')
      .send(credentials);

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.token, 'Response should have a token property');
  });
});
