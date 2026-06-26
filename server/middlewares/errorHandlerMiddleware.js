const handledClientErrorNames = new Set([
  'CastError',
  'BadRequest',
  'Unauthorized',
  'TokenExpiredError',
  'JWTExpired',
  'JsonWebTokenError',
  'JWSSignatureVerificationFailed',
  'JWTClaimValidationFailed',
  'JWTInvalid',
  'JWSInvalid',
  'Forbidden',
  'NotFound',
  'User not found',
  'Pet not found',
  'ValidationError',
  'ZodError',
]);

const handledOperationalCodes = new Set([
  'EAUTH',
  'ECONNECTION',
  'ESOCKET',
  'ETIMEDOUT',
  'EMESSAGE',
]);

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
  const statusCode = error.status || 500;
  const message = error.message || 'An unexpected error occurred';

  if (
    statusCode >= 500 &&
    !handledClientErrorNames.has(error.name) &&
    !handledOperationalCodes.has(error.code) &&
    !error.code?.startsWith('ERR_JWT') &&
    !error.code?.startsWith('ERR_JWS')
  ) {
    console.error(error);
  }

  const errorResponse = {
    message,
  };

  // Malformed JSON body: express.json() throws a SyntaxError with status 400 and
  // type 'entity.parse.failed'. Return a clean message instead of leaking the
  // raw parser error (e.g. "Unexpected token ... in JSON").
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Invalid JSON body' });
  }

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
    case 'TokenExpiredError': // Jsonwebtoken legacy
    case 'JWTExpired': // Jose
      errorResponse.message = 'Token Expired';
      return response.status(401).json(errorResponse);
    case 'JsonWebTokenError': // Jsonwebtoken legacy
    case 'JWSSignatureVerificationFailed': // Jose
    case 'JWTClaimValidationFailed': // Jose
    case 'JWTInvalid': // Jose
    case 'JWSInvalid': // Jose - invalid compact JWS
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
      // Expose per-field messages in the same { field: [messages] } shape the
      // frontend and the controllers' zod responses use.
      errorResponse.errorDetails = Object.fromEntries(
        Object.entries(error.errors).map(([field, fieldError]) => [
          field,
          [fieldError.message],
        ]),
      );
      return response.status(422).json(errorResponse);
    case 'MongoServerError':
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        errorResponse.message = `${field} already exists`;
        return response.status(409).json(errorResponse);
      }

      return response.status(statusCode).json(errorResponse);
    case 'ZodError':
      errorResponse.errorDetails = error.flatten().fieldErrors;
      return response.status(422).json(errorResponse);

    case 'SMTPAuthenticationError': // Specific SMTP authentication error
      errorResponse.message =
        'Email authentication failed. Please contact support.';
      return response.status(502).json(errorResponse);

    case 'SMTPError':
      errorResponse.message = 'Email Error';
      return response.status(502).json(errorResponse);

    default:
      if (error.code === 'EAUTH') {
        errorResponse.message =
          'Email authentication failed. Please contact support.';
        return response.status(502).json(errorResponse);
      }

      if (
        ['ECONNECTION', 'ESOCKET', 'ETIMEDOUT', 'EMESSAGE'].includes(error.code)
      ) {
        errorResponse.message = 'Unable to send email. Please try again later.';
        return response.status(502).json(errorResponse);
      }

      // Catch jose errors by error code as fallback
      if (error.code && error.code.startsWith('ERR_JWT')) {
        errorResponse.message =
          error.code === 'ERR_JWT_EXPIRED' ? 'Token Expired' : 'Invalid token';
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
