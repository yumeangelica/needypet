/**
 * @description Ensures request.body is always an object. express.json() only
 * populates the body when the request carries a JSON content type and payload;
 * otherwise it leaves request.body as undefined, which makes downstream
 * destructuring (e.g. `const { newPassword } = request.body`) throw a 500. The
 * client always sends application/json, but this keeps malformed or
 * header-less requests returning clean 4xx validation errors instead of
 * crashing a handler. Must run directly after express.json().
 * @param {*} request
 * @param {*} _response
 * @param {*} next
 */
const jsonBodyDefault = (request, _response, next) => {
  if (request.body === undefined || request.body === null) {
    request.body = {};
  }

  next();
};

module.exports = jsonBodyDefault;
