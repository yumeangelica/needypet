const Pet = require('../models/petModel');

/**
 * @description Finds a pet by id and attaches it to the request object
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const getPetHandler = async (request, response, next) => {
  const petId = request.params.id;
  request.pet = null;

  try {
    const pet = await Pet.findById(petId);

    if (!pet) {
      const error = new Error('Pet not found');
      error.name = 'NotFound';
      throw error;
    }

    request.pet = pet;

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = getPetHandler;
