/**
 * @description Checks if the user is a pet care taker
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const petCareTakerValidationMiddleware = (request, response, next) => {
  if (!(request.pet.careTakers.some(ct => ct.equals(request.user._id)) || request.pet.owner.toString() === request.user._id.toString())) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

module.exports = petCareTakerValidationMiddleware;
