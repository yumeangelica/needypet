const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../utils/config');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const loginValidation = require('../validations/loginValidation');
const registerValidation = require('../validations/registerValidation');
const updateUserValidation = require('../validations/updateUserValidation');
const z = require('zod');
const passwordStrengthValidation = require('../validations/passwordStrengthValidation');

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

// This will be in use in the future version, not yet implemented
/**
 * @description Gets the user by username and returns id and username - Will be used for pet owner and pet care taker
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const getUserByName = async (request, response, next) => {
  try {
    const userName = request.params.userName;
    const user = await User.findOne({ userName });
    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.status(200).json({ id: user._id, userName: user.userName });
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
  try {
    const validationResult = registerValidation(request.body); // Validate request body

    const { userName, email, newPassword, timezone } = validationResult;

    const existing = await User.findOne({ $or: [{ userName }, { email }] });

    if (existing && existing.userName === userName) {
      return next({
        status: 400,
        message: 'Username already exists',
      });
    }

    if (existing && existing.email === email) {
      return next({
        status: 400,
        message: 'Email already exists',
      });
    }

    const user = new User({ userName, email, timezone });

    user.setPassword(newPassword); // Setting password with method from userModel which hashes the password

    user.generateEmailConfirmToken(); // Generate email confirmation token

    await user.save();

    await sendConfirmationEmail(user.email, user.emailConfirmToken); // Send confirmation email to user

    response.status(201).json('user');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.flatten());
      const errorDetails = error.flatten();
      return response.status(422).json({
        message: 'Validation error',
        errorDetails: errorDetails.fieldErrors,
      });
    }

    next(error);
  }
};

/**
 * @description Updates the user details with or without new password
 */
const updateUser = async (request, response, next) => {
  try {
    const user = request.user;
    const isPasswordUpdate = request.body.newPassword && request.body.currentPassword; // Check if password is being updated
    const validationResult = updateUserValidation(request.body, isPasswordUpdate); // Validate request body with or without new password

    // If password is being updated
    if (isPasswordUpdate) {
      const { newPassword, currentPassword } = validationResult;

      if (!user.isValidPassword(currentPassword)) { // Check if current password is valid
        return next({
          status: 401,
          message: 'Invalid current password',
        });
      }

      try {
        passwordStrengthValidation(newPassword); // Validate password strength
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log('Password strength validation error:', error.flatten());
          const errorDetails = error.flatten();
          return response.status(422).json({
            message: 'Password strength validation error',
            errorDetails: errorDetails.fieldErrors,
          });
        }

        return next(error);
      }

      user.setPassword(newPassword);
      await user.save();
      return response.status(200).json({ message: 'Password updated successfully' });
    }

    // If password is not being updated
    const { userName, email, currentPassword, timezone } = validationResult;

    if (!currentPassword || !user.isValidPassword(currentPassword)) {
      return next({
        status: 401,
        message: 'Invalid current password',
      });
    }

    // Update user properties
    if (userName && userName !== user.userName) {
      user.userName = userName;
    }

    if (email && email !== user.email) {
      user.email = email;
      user.emailConfirmed = false; // Set emailConfirmed to false if email is updated
      user.generateEmailConfirmToken(); // Generate new email confirmation token
      console.log('Email confirmation sent to:', user.email);
    }

    if (timezone && timezone !== user.timezone) {
      user.timezone = timezone;
    }

    await user.save(); // Save updated user to database
    await sendConfirmationEmail(user.email, user.emailConfirmToken); // Send confirmation email to user after saving

    response.status(200).json({
      message: 'User updated successfully',
      id: user._id,
      userName: user.userName,
      email: user.email,
      timezone: user.timezone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.flatten());
      const errorDetails = error.flatten();
      return response.status(422).json({
        message: 'Validation error',
        errorDetails: errorDetails.fieldErrors,
      });
    }

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
    await User.findByIdAndDelete(user.id);

    response.status(204).json({ message: 'User deleted successfully' });
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
 * @returns JWT token and user details
 */
const loginUser = async (request, response, next) => {
  try {
    const validationResult = loginValidation(request.body); // Validate request body

    const { userName, password } = validationResult;

    const user = await User.findOne({ userName });

    if (!user || !user.isValidPassword(password)) {
      return next({
        status: 401,
        message: 'Invalid credentials',
      });
    }

    const token = user.generateJWT(); // Generate token with method from userModel

    response.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userName: user.userName,
        id: user._id,
        timezone: user.timezone,
        emailConfirmed: user.emailConfirmed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.flatten());
      return response.status(422).json({
        message: 'Validation error',
      });
    }

    next(error);
  }
};

/**
 * @description If user has forgotten password, they can request a password reset link
 */
const requestPasswordReset = async (request, response, next) => {
  const { email } = request.body;

  try {
    const user = await User.findOne({ email }); // Find user by email

    // Not revealing if user exists or not to avoid email enumeration
    if (!user) {
      return response.status(200).json({ message: 'Password reset link sent to email' });
    }

    if (!user.canResendVerificationEmail()) {
      return response.status(200).json({ message: 'Password reset link sent to email' });
    }

    user.generatePasswordResetToken(); // Generate password reset token
    await user.save(); // Save updated user to database
    await sendPasswordResetEmail(user.email, user.passwordResetToken); // Send password reset email to user

    response.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Validates the user token
 */
const validateUserToken = async (request, response, next) => {
  const authHeader = request.headers.authorization; // Get authorization header
  let token = null; // Initialize token so it can be used outside of if statement
  if (!authHeader) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  }

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7); // Extract token from header starting from index 7
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret); // Verify token with secret key

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token invalid' });
    }

    console.log('Token validated:', token);
    response.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Verifies the email confirmation token
 */
const verifyEmailConfirmationToken = async (request, response, next) => {
  const { token, email } = request.body;

  try {
    const user = await User.findOne({ email, emailConfirmToken: token }); // Find user by email and token

    if (!user) { // If user not found or token is invalid
      return response.status(401).json({ error: 'Invalid token' });
    }

    if (!user.verifyEmailConfirmToken(token)) {
      return response.status(401).json({ error: 'Token expired' });
    }

    user.emailConfirmed = true; // Set emailConfirmed to true
    user.emailConfirmToken = null; // Remove token
    user.emailConfirmTokenExpires = null; // Remove expiration date
    await user.save(); // Save updated user to database

    response.status(200).json({ message: 'Email confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Resends the email confirmation to the user
 */
const resendEmailConfirmation = async (request, response, next) => {
  const user = request.user; // User is attached to the request object by getUserHandler middleware

  if (!user.canResendVerificationEmail()) {
    return response.status(400).json({ error: 'Cannot resend email confirmation yet' });
  }

  try {
    user.generateEmailConfirmToken(); // Generate new email confirmation token
    await user.save(); // Save updated user to database
    await sendConfirmationEmail(user.email, user.emailConfirmToken); // Send confirmation email to user

    response.status(200);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Verifies the password reset token
 */
const verifyPasswordResetToken = async (request, response, next) => {
  const { token, email } = request.body;

  try {
    const user = await User.findOne({ email, passwordResetToken: token }); // Find user by email and token

    if (!user || !user.verifyPasswordResetToken(token)) { // If user not found or token is invalid
      return response.status(401).json({ error: 'Invalid token' });
    }

    response.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Resets the user password
 */
const passwordReset = async (request, response, next) => {
  const { token, email, newPassword } = request.body;

  try {
    const user = await User.findOne({ email, passwordResetToken: token }); // Find user by email and token

    if (!user || !user.verifyPasswordResetToken(token)) { // If user not found or token is invalid
      return response.status(401).json({ error: 'Invalid token' });
    }

    user.setPassword(newPassword); // Set new password
    user.passwordResetToken = null; // Remove token
    user.passwordResetExpires = null; // Remove expiration date
    await user.save(); // Save updated user to database

    response.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById,
  getUserByName,
  createNewUser,
  updateUser,
  deleteUser,
  loginUser,
  validateUserToken,
  verifyEmailConfirmationToken,
  resendEmailConfirmation,
  requestPasswordReset,
  verifyPasswordResetToken,
  passwordReset,
};
