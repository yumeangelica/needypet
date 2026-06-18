const {
  describe,
  it,
  before,
  after,
  afterEach,
  beforeEach,
  mock,
} = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { mongodbUri } = require('../utils/config');
const { createNewUser, updateUser } = require('../controllers/userController');
const mailer = require('../utils/mailer');

/**
 * Helper to create a mock response object
 */
const createMockResponse = () => {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.jsonData = data;
      return res;
    },
  };
  // Spy on status and json
  mock.method(res, 'status');
  mock.method(res, 'json');
  return res;
};

// Connect to database before running tests
before(async () => {
  await mongoose.connect(mongodbUri);
  await User.deleteMany({});
});

describe('GET /auth/users', () => {
  let request;
  let response;
  let next;

  beforeEach(async () => {
    await User.deleteMany({});

    request = {
      body: {
        userName: 'testUser123',
        email: 'test@example.com',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
    };

    response = createMockResponse();
    next = mock.fn();
  });

  it('returns all users', async () => {
    await createNewUser(request, response, next);

    assert.strictEqual(response.status.mock.calls.length, 1);
    assert.strictEqual(response.status.mock.calls[0].arguments[0], 201);
    assert.strictEqual(response.json.mock.calls.length, 1);

    const users = await User.find({});
    assert.strictEqual(users.length, 1);
  });
});

describe('POST /auth/users', () => {
  let request;
  let response;
  let next;

  beforeEach(async () => {
    await User.deleteMany({});

    request = {
      body: {
        userName: 'testUser123',
        email: 'test@example.com',
        newPassword: 'testPass123',
        timezone: 'Europe/Helsinki',
      },
    };

    response = createMockResponse();
    next = mock.fn();
  });

  it('creates a new user', async () => {
    await createNewUser(request, response, next);

    assert.strictEqual(response.status.mock.calls[0].arguments[0], 201);
    assert.strictEqual(response.json.mock.calls.length, 1);

    const created = await User.findOne({ userName: request.body.userName });
    assert.ok(created, 'User should be created in database');
  });

  it('user creation fails if email is missing', async () => {
    delete request.body.email;

    await createNewUser(request, response, next);

    assert.strictEqual(response.status.mock.calls[0].arguments[0], 422);
    assert.strictEqual(response.json.mock.calls.length, 1);
    assert.strictEqual(
      response.json.mock.calls[0].arguments[0].message,
      'Validation error',
    );
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

  for (const { description, body } of testCases) {
    it(`should not create a new user if ${description}`, async () => {
      const request = { body };
      const response = createMockResponse();
      const next = mock.fn();

      await createNewUser(request, response, next);

      // Verify that the appropriate error response is sent
      assert.strictEqual(response.status.mock.calls[0].arguments[0], 422);
      assert.strictEqual(
        response.json.mock.calls[0].arguments[0].message,
        'Validation error',
      );
    });
  }
});

describe('PUT /auth/users/:id (updateUser)', () => {
  const password = 'testPass123';
  let user;

  beforeEach(async () => {
    await User.deleteMany({});

    await createNewUser(
      {
        body: {
          userName: 'editUser123',
          email: 'edit@example.com',
          newPassword: password,
          timezone: 'Europe/Helsinki',
        },
      },
      createMockResponse(),
      mock.fn(),
    );

    user = await User.findOne({ userName: 'editUser123' });
  });

  it('sends a confirmation email when the email changes', async (t) => {
    const sendMock = t.mock.method(mailer, 'sendConfirmationEmail', () =>
      Promise.resolve(),
    );

    const response = createMockResponse();
    await updateUser(
      {
        user,
        body: { email: 'changed@example.com', currentPassword: password },
      },
      response,
      mock.fn(),
    );

    assert.strictEqual(response.status.mock.calls[0].arguments[0], 200);
    assert.strictEqual(sendMock.mock.calls.length, 1);

    const updated = await User.findById(user._id);
    assert.strictEqual(updated.email, 'changed@example.com');
    assert.strictEqual(updated.emailConfirmed, false);
  });

  it('does not send a confirmation email when the email is unchanged', async (t) => {
    const sendMock = t.mock.method(mailer, 'sendConfirmationEmail', () =>
      Promise.resolve(),
    );

    const response = createMockResponse();
    await updateUser(
      { user, body: { email: 'edit@example.com', currentPassword: password } },
      response,
      mock.fn(),
    );

    assert.strictEqual(response.status.mock.calls[0].arguments[0], 200);
    assert.strictEqual(sendMock.mock.calls.length, 0);
  });
});

// Cleanup created test users after tests
afterEach(async () => {
  await User.deleteMany({});
});

// Close database connection after running tests
after(async () => {
  await mongoose.connection.close();
});
