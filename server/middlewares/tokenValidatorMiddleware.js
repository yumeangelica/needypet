const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../utils/config');

/**
 * @description Authenticates token and attaches decoded token to request object
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers.authorization; // Get authorization header
  let token = null; // Initialize token so it can be used outside of if statement
  request.decodedToken = null; // Initialize user so it can be used outside of try-catch block

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

    request.decodedToken = decodedToken; // Add decoded token to request object
  } catch (error) {
    next(error);
  }

  next();
};

module.exports = authenticateToken;
