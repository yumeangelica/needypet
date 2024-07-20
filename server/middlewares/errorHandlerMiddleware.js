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

  const statusCode = error.status || 500;
  const message = error.message || 'An unexpected error occurred';

  const errorResponse = {
    message,
  };

  // Specific error handling
  switch (error.name) {
  case 'CastError':
    errorResponse.message = 'Malformatted id';
    return response.status(400).json(errorResponse);
  case 'BadRequest':
    errorResponse.message = 'Bad Request';
    return response.status(400).json(errorResponse);
  case 'Unauthorized':
    errorResponse.message = 'Unauthorized';
    return response.status(401).json(errorResponse);
  case 'TokenExpiredError':
    errorResponse.message = 'Token Expired';
    return response.status(401).json(errorResponse);
  case 'JsonWebTokenError':
    errorResponse.message = 'Invalid token';
    return response.status(401).json(errorResponse);
  case 'Forbidden':
    errorResponse.message = 'Forbidden';
    return response.status(403).json(errorResponse);
  case 'NotFound':
  case 'User not found':
  case 'Pet not found':
    return response.status(404).json(errorResponse);
  case 'ValidationError':
    errorResponse.details = error.errors;
    return response.status(422).json(errorResponse);
  case 'ZodError':
    errorResponse.details = error.flatten();
    return response.status(422).json(errorResponse);
  default:
    return response.status(statusCode).json(errorResponse);
  }
};

module.exports = errorHandler;
