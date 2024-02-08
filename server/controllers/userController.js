const User = require('../models/userModel');
const helper = require('../helper');

const getAllUsers = async (request, response) => { // Only for dev, later will be removed
  try {
    const users = await User.find({}).populate('pets', 'name');
    response.json(users);
  } catch (error) {
    console.log('error getting users');
    console.log(error);
  }
};

const getUserById = async (request, response, next) => {
  const { id } = request.params;

  try {
    const user = await User.findById(id).populate('pets', 'name');

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const createNewUser = async (request, response, next) => {
  const { userName, email, password, timezone } = request.body;

  // Validations
  if (!userName) {
    return response.status(400).json({ error: 'Username is required' });
  }

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  if (!password) {
    return response.status(400).json({ error: 'Password is required' });
  }

  if (!timezone || !helper.tzIdentifierChecker(timezone)) { // Check if there is timezone or it is valid
    return response.status(400).json({ error: 'Invalid timezone' });
  }

  // Create new user object
  const newUserObject = {
    userName,
    email,
    timezone,
  };

  const newUser = new User(newUserObject); // Creating new user without password

  try {
    newUser.setPassword(password); // Setting password with method from userModel which hashes the password
    await newUser.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (request, response, next) => {
  const { id } = request.params;
  const { userName, email, password, timezone } = request.body;

  try {
    const user = await User.findById(id); // Find user by id

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    // Update user properties
    if (userName) {
      user.userName = userName;
    }

    if (email) {
      user.email = email;
    }

    if (timezone && helper.tzIdentifierChecker(timezone) && timezone !== user.timezone) { // Check if there is timezone, it is valid and it is different from the current timezone
      user.timezone = timezone;
    }

    // Check if password is given
    if (password) {
      user.setPassword(password); // Password is hashed with method from userModel
    }

    await user.save(); // Save updated user to database
    response.status(200).json({ message: 'User updated successfully', id: user._id, userName: user.userName, email: user.email });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

const deleteUser = async (request, response, next) => {
  const { id } = request.params;

  try {
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
};

// Login functionality
const loginUser = async (request, response, next) => {
  const { userName, password } = request.body;

  try {
    const user = await User.findOne({ userName }); // Find user by username

    if (!user || !(await user.isValidPassword(password))) { // If user not found or password is wrong
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const token = user.generateJWT(); // Generate token with method from userModel
    response.status(200).json({ token, userName: user.userName, id: user._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUser,
  deleteUser,
  loginUser,
};
