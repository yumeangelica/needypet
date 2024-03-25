const mongoose = require('mongoose');
const User = require('../models/userModel');
const { mongodbUri } = require('../utils/config');
const { createNewUser } = require('../controllers/userController');

// Connect to database before running tests
beforeAll(async () => {
  await mongoose.connect(mongodbUri);
});

let createdUserId; // Save created user id for cleanup

describe('GET /auth/users', () => {
  let request;
  let response;
  let next;

  beforeEach(async () => {
    request = {
      body: {
        userName: 'testUser123',
        email: 'test@example.com',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
    };

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation(result => {
        createdUserId = result._id;
      }),
    };

    next = jest.fn();
  });

  it('returns all users', async () => {
    await createNewUser(request, response, next);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalled();

    const users = await User.find({});
    expect(users).toHaveLength(1);
  });
});

describe('POST /auth/users', () => {
  let request;
  let response;
  let next;

  beforeEach(async () => {
    request = {
      body: {
        userName: 'testUser123',
        email: 'test@example.com',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
    };

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation(result => {
        createdUserId = result._id;
      }),
    };

    next = jest.fn();
  });

  it('creates a new user', async () => {
    await createNewUser(request, response, next);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalled();

    const created = await User.findOne({ userName: request.body.userName });

    expect(created).toBeDefined();
  });

  it('user creation fails if email is missing', async () => {
    delete request.body.email;

    await createNewUser(request, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Email is required' });
  });
});

describe('POST /auth/users -testcases', () => {
  const testCases = [
    {
      description: 'userName is missing',
      body: {
        email: 'test@example.com',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
      expectedError: 'Username is required',
    },
    {
      description: 'email is missing',
      body: {
        userName: 'testUser123',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
      expectedError: 'Email is required',
    },
    {
      description: 'newPassword is missing',
      body: {
        userName: 'testUser123',
        email: 'test@example.com',
        timezone: 'Europe/Helsinki',
      },
      expectedError: 'newPassword is required',
    },
  ];

  testCases.forEach(({ description, body, expectedError }) => {
    it(`should not create a new user if ${description}`, async () => {
      const request = { body };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await createNewUser(request, response, next);

      // Verify that the appropriate error response is sent
      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: expectedError });
    });
  });
});

// Cleanup created test users after tests
afterEach(async () => {
  if (createdUserId) {
    await User.findByIdAndDelete(createdUserId);
    createdUserId = null;
  }
});

// Close database connection after running tests
afterAll(async () => {
  await mongoose.connection.close();
});
