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
      throw new Error('Pet not found');
    }

    request.pet = pet; // Attaching pet to the request object
  } catch (error) {
    error.name = 'NotFound';
    next(error);
  }

  next();
};

module.exports = getPetHandler;
