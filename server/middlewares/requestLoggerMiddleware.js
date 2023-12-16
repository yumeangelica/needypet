const config = require('../utils/config');

const requestLogger = (request, response, next) => {
  const start = new Date();
  
  response.on('finish', () => {
    const duration = new Date() - start;
    const logMessage = [
      new Date().toISOString(),
      request.method,
      request.originalUrl,
      'Status:', response.statusCode,
      `Duration: ${duration}ms`
    ];

    if (config.isDevelopment) { // log request body only in development mode
      logMessage.push('Query:', JSON.stringify(request.query));
      logMessage.push('Body:', JSON.stringify(request.body));
    }

    console.log(logMessage.join(' '));
  });

  next();
};

module.exports = requestLogger;