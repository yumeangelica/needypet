const { allowedOrigins } = require('./config');

/**
 * @description CORS configuration for the server
 */
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const corsHeaders = (request, response, next) => {
  response.header('Access-Control-Allow-Origin', allowedOrigins);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  next();
};

module.exports = { corsOptions, corsHeaders };
