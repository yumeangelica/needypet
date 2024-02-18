/**
 * @description Checks if the user is the pet owner
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const petOwnerValidationMiddleware = (request, response, next) => {
  if (request.pet.owner.toString() !== request.user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

module.exports = petOwnerValidationMiddleware;
