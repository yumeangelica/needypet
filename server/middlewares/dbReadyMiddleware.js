const mongoose = require('mongoose');

/**
 * @description Fails fast when the database is not connected, instead of letting
 * Mongoose buffer the operation until it times out (~10s). Returns 503 so the
 * client gets an immediate, clear response.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const dbReady = (request, response, next) => {
  // 1 = connected. 0 = disconnected, 2 = connecting, 3 = disconnecting.
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      message: 'Service temporarily unavailable. Please try again.',
    });
  }

  next();
};

module.exports = dbReady;
