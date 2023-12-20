const mongoose = require('mongoose');
const User = require('../models/userModel');
const config = require('../utils/config');
const { createNewUser } = require('../controllers/userController');

describe('User creation and validation tests', () => {
  let createdUserId; // Save created user id for cleanup

  // Connect to database before running tests
  beforeAll(async () => {
    await mongoose.connect(config.databaseUrl);
  });

  // Test to create user
  it('should create a new user', async () => {
    const request = {
      body: {
        userName: 'testUser123',
        password: 'testPass123',
      },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createNewUser(request, response);

    expect(response.status).toHaveBeenCalledWith(201); // Check that status code is 201
    expect(response.json).toHaveBeenCalled(); // Check that json method is called

    const createdUser = await User.findOne({ userName: request.body.userName }); // Find created user
    expect(createdUser).toBeDefined();
    createdUserId = createdUser._id; // Save created user id for cleanup
  });

  // Test to not create a user if username is missing
  it('should not create a new user if username is missing', async () => {
    const request = {
      body: {
        password: 'testPass123',
      },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await createNewUser(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error)); // Check that next is called with an error
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
});
