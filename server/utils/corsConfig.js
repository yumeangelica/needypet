const { allowedOrigins } = require('./config');

/**
 * @description CORS configuration for the server
 */
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

const corsHeaders = (request, response, next) => {
  // Reflect the request origin only when it is in the allowed list, so the
  // value always matches the actual origin (required with credentials: true).
  const requestOrigin = request.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.header('Access-Control-Allow-Origin', requestOrigin);
  }

  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  next();
};

module.exports = { corsOptions, corsHeaders };
