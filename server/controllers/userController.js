const User = require('../models/userModel');
const { passwordStrengthValidator } = require('../middlewares/passwordStrengthValidator');
/**
 * @description Gets all users (only for dev, later will be removed)
 * @param {*} request
 * @param {*} response
 */
const getAllUsers = async (request, response) => { // Only for dev, later will be removed
  try {
    const users = await User.find({}).populate('pets', 'name');
    response.json(users);
  } catch (error) {
    console.log('error getting users');
    console.log(error);
  }
};

/**
 * @description Gets the user by id
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const getUserById = async (request, response, next) => {
  try {
    const user = request.user; // User is attached to the request object by getUserHandler middleware
    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Creates a new user
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const createNewUser = async (request, response, next) => {
  const { userName, email, newPassword, timezone } = request.body;

  // Validations
  if (!userName) {
    return response.status(400).json({ error: 'Username is required' });
  }

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  if (!newPassword) {
    return response.status(400).json({ error: 'newPassword is required' });
  }

  // Create new user object
  const newUserObject = {
    userName,
    email,
    timezone,
  };

  const newUser = new User(newUserObject); // Creating new user without newPassword

  try {
    newUser.setPassword(newPassword); // Setting password with method from userModel which hashes the password
    await newUser.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Updates the user password
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
*/

const updateUserPassword = async (request, response, next) => {
  try {
    const user = request.user; // User is attached to the request object by getUserHandler middleware

    const { newPassword, currentPassword } = request.body;

    if (!newPassword) {
      return response.status(400).json({ error: 'New password is required' });
    }

    if (currentPassword && !user.isValidPassword(currentPassword)) {
      return response.status(401).json({ error: 'Invalid current password' });
    }

    user.setPassword(newPassword);
    await user.save();
    response.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

/**
 * @description Updates the user
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const updateUser = async (request, response, next) => {
  if (request.body.newPassword && request.body.currentPassword) {
    await passwordStrengthValidator(request, response, next);
    await updateUserPassword(request, response, next);
    return;
  }

  const { userName, email, currentPassword, timezone } = request.body;

  try {
    const user = request.user; // User is attached to the request object by getUserHandler middleware

    if (!currentPassword || !user.isValidPassword(currentPassword)) {
      return response.status(401).json({ error: 'Invalid current password' });
    }

    // Update user properties
    if (userName) {
      user.userName = userName;
    }

    if (email) {
      user.email = email;
    }

    if (timezone) { // Check if there is timezone, it is valid and it is different from the current timezone
      user.timezone = timezone;
    }

    await user.save(); // Save updated user to database
    response.status(200).json({ message: 'User updated successfully', id: user._id, userName: user.userName, email: user.email });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

/**
 * @description Deletes the user
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const deleteUser = async (request, response, next) => {
  try {
    const user = request.user; // User is attached to the request object by getUserHandler middleware
    const result = await User.findByIdAndDelete(user.id);

    if (!result) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
};

/**
 * @description Logs in the user
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
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
