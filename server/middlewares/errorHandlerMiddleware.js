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
    case 'TokenExpiredError': // jsonwebtoken legacy
    case 'JWTExpired': // jose
      errorResponse.message = 'Token Expired';
      return response.status(401).json(errorResponse);
    case 'JsonWebTokenError': // jsonwebtoken legacy
    case 'JWSSignatureVerificationFailed': // jose
    case 'JWTClaimValidationFailed': // jose
    case 'JWTInvalid': // jose
    case 'JWSInvalid': // jose - invalid compact JWS
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
    case 'MongoServerError':
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        errorResponse.message = `${field} already exists`;
        return response.status(409).json(errorResponse);
      }

      return response.status(statusCode).json(errorResponse);
    case 'ZodError':
      errorResponse.details = error.flatten();
      return response.status(422).json(errorResponse);

    case 'SMTPAuthenticationError': // Specific SMTP authentication error
      errorResponse.message = 'Email authentication failed. Please contact support.';
      return response.status(535).json(errorResponse);

    case 'SMTPError':
      errorResponse.message = 'Email Error';
      return response.status(535).json(errorResponse);

    default:
      // Catch jose errors by error code as fallback
      if (error.code && error.code.startsWith('ERR_JWT')) {
        errorResponse.message = error.code === 'ERR_JWT_EXPIRED' ? 'Token Expired' : 'Invalid token';
        return response.status(401).json(errorResponse);
      }

      if (error.code && error.code.startsWith('ERR_JWS')) {
        errorResponse.message = 'Invalid token';
        return response.status(401).json(errorResponse);
      }

      return response.status(statusCode).json(errorResponse);
  }
};

module.exports = errorHandler;
