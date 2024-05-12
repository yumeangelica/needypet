/**
 * @description Error handler middleware
 * @param {*} error
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
*/
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  console.error(error);

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Malformatted id' });
  }

  if (error.name === 'BadRequest') {
    return response.status(400).json({ error: 'Bad Request', message: error.message });
  }

  if (error.name === 'Unauthorized') {
    return response.status(401).json({ error: 'Unauthorized', message: error.message });
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token Expired', message: error.message });
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token', message: error.message });
  }

  if (error.name === 'Forbidden') {
    return response.status(403).json({ error: 'Forbidden', message: error.message });
  }

  if (error.name === 'NotFound') {
    return response.status(404).json({ error: 'Not Found', message: error.message });
  }

  if (error.name === 'User not found') {
    return response.status(404).json({ error: 'User not found', message: error.message });
  }

  if (error.name === 'Pet not found') {
    return response.status(404).json({ error: 'Pet not found', message: error.message });
  }

  if (error.name === 'ValidationError') {
    return response.status(422).json({ error: 'Validation error', errors: error.errors });
  }

  // Handle Zod validation errors specifically
  if (error.name === 'ZodError') {
    return response.status(422).json({ error: 'Zod validation error', details: error.flatten() });
  }

  // Other errors, for example database errors
  response.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
