/**
 * @description Checks if the user is the pet owner
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const petOwnerValidationMiddleware = (request, response, next) => {
  if (request.pet.owner.toString() !== request.user._id.toString()) {
    // The user is authenticated but not the pet's owner: this is an
    // authorization failure (403 Forbidden), not an authentication one (401).
    return response.status(403).json({ message: 'Forbidden' });
  }

  next();
};

module.exports = petOwnerValidationMiddleware;
