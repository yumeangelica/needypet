const { isDevelopment } = require('../utils/config');

/**
 * @description Logs request method, url, status, and duration. Includes query and body in development mode.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const requestLogger = (request, response, next) => {
  const start = new Date();

  response.on('finish', () => {
    const duration = new Date() - start;
    const logParts = [
      new Date().toISOString(),
      request.method,
      request.originalUrl,
      'Status:',
      response.statusCode,
      `Duration: ${duration}ms`,
    ];

    // Log query and body in development mode
    if (isDevelopment) {
      logParts.push(`Query: ${JSON.stringify(request.query)}`, `Body: ${JSON.stringify(request.body)}`);
    }

    console.log(logParts.join(' '));
  });

  next();
};

module.exports = requestLogger;
