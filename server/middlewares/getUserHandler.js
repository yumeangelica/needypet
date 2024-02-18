const User = require('../models/userModel');

/**
 * @description Finds a user by id and attaches it to the request object
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const getUserHandler = async (request, response, next) => {
  request.user = null;

  try {
    const { id } = request.decodedToken;
    const user = await User.findById(id);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    request.user = user;
  } catch (error) {
    console.error('Error getting user:', error);
    next(error);
  }

  next();
};

module.exports = getUserHandler;
