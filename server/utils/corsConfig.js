const { allowedOrigins } = require('./config');

/**
 * @description CORS configuration for the server
 */
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
