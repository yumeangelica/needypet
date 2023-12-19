const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const authenticateToken = (request, response, next) => {
  const authHeader = request.headers.authorization; // Get authorization header
  let token = null; // Initialize token so it can be used outside of if statement

  if (!authHeader) {
    return response.status(401).json({ error: 'Token missing or invalid' });
  }

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7); // Extract token from header starting from index 7
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret); // Verify token with secret key

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token invalid' });
    }

    request.user = decodedToken; // Add decoded token to request object
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateToken;
