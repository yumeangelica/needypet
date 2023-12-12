const errorHandler = (error, request, response, next) => {
  console.error(error);

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(422).json({ error: 'Validation error', errors: error.errors });
  }

  if (error.name === 'NotFound') {
    return response.status(404).json({ error: 'Not Found', message: error.message });
  }

  if (error.name === 'Unauthorized') {
    return response.status(401).json({ error: 'Unauthorized', message: error.message });
  }

  if (error.name === 'Forbidden') {
    return response.status(403).json({ error: 'Forbidden', message: error.message });
  }

  if (error.name === 'BadRequest') {
    return response.status(400).json({ error: 'Bad Request', message: error.message });
  }

  // other errors, for example database errors
  response.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
