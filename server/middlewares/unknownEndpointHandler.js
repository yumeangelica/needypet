/**
 * @description Middleware to handle unknown endpoint
 * @param {*} request
 * @param {*} response
 */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

module.exports = unknownEndpoint;
