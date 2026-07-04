/**
 * @description Checks if the user is a pet care taker
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const petCareTakerValidationMiddleware = (request, response, next) => {
  if (
    !(
      request.pet.careTakers.some((ct) => ct.equals(request.user._id)) ||
      request.pet.owner.toString() === request.user._id.toString()
    )
  ) {
    // The user is authenticated but neither the owner nor a caretaker of this
    // pet: an authorization failure (403 Forbidden), not authentication (401).
    return response.status(403).json({ message: 'Forbidden' });
  }

  next();
};

module.exports = petCareTakerValidationMiddleware;
