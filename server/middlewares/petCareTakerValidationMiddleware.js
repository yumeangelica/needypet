/**
 * @description Checks if the user is a pet care taker
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const petCareTakerValidationMiddleware = (request, response, next) => {
  if (!(request.pet.careTakers.includes(request.user.id.toString()) || request.pet.owner.toString() === request.user.id.toString())) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

module.exports = petCareTakerValidationMiddleware;
