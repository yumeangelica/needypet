const { isDevelopment } = require('../utils/config');

// Keys whose values must never reach the logs, even in development.
const SENSITIVE_KEYS = [
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'passwordResetToken',
];

/**
 * @description Returns a shallow copy of the body with sensitive fields redacted.
 * @param {*} body
 * @returns redacted copy, or the original value when it is not a plain object
 */
const redactBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const redacted = { ...body };
  for (const key of SENSITIVE_KEYS) {
    if (key in redacted) {
      redacted[key] = '[REDACTED]';
    }
  }

  return redacted;
};

/**
 * @description Logs request method, url, status, and duration. Includes query and body in development mode.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const requestLogger = (request, response, next) => {
  const start = Date.now();

  response.on('finish', () => {
    const duration = Date.now() - start;
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
      logParts.push(
        `Query: ${JSON.stringify(request.query)}`,
        `Body: ${JSON.stringify(redactBody(request.body))}`,
      );
    }

    console.log(logParts.join(' '));
  });

  next();
};

module.exports = requestLogger;
