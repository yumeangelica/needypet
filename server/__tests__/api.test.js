const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');

beforeAll(() => {
  mongoose.connect(mongodbUri);
});

afterAll(async () => {
  await User.deleteMany({});
  mongoose.connection.close();
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
    await supertest(app)
      .post('/auth/users')
      .send(newUserObject)
      .expect(201);
  });

  it('allows a user to log in and returns a token', async () => {
    await supertest(app)
      .post('/auth/users')
      .send(newUserObject)
      .expect(201);

    const response = await supertest(app)
      .post('/auth/login')
      .send(credentials)
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });
});
