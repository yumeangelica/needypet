const Pet = require('../models/petModel');

// get all pets
const getAllPets = async (request, response) => {
  const pets = await Pet.find({});
  response.json(pets);
};

// get pet by id
const getPetById = async (request, response, next) => {
  const id = request.params.id;

  try {
    const pet = await Pet.findById(id);
    if (!pet) {
      throw new Error('Pet not found');
    }
    response.json(pet);
  } catch (error) {
    error.name = 'NotFound';
    next(error);
  }
};

// add new pet
const addNewPet = async (request, response, next) => {

    const newPet = {
      name: request.body.name,
      breed: request.body.breed,
      description: request.body.description,
      birthday: request.body.birthday,
    }

    try {
      const pet = await Pet.addNewPet(newPet); // custom function for adding new pet
      response.status(201).json(pet);
    } catch (error) {
      next(error)
    }

};

// update pet by id
const updatePet = async (request, response, next) => {
  const id = request.params.id;
  const updateData = request.body;

  try {
    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedPet) {
      throw new Error('Pet not found');
    }
    response.json(updatedPet);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(error);
    } else {
      error.name = 'NotFound';
      next(error);
    }
  }
};

// delete pet by id
const deletePet = async (request, response, next) => {
  const id = request.params.id;

  try {
    const deletedPet = await Pet.findByIdAndDelete(id);
    if (!deletedPet) {
      throw new Error('Pet not found');
    }
    response.status(204).end();
  } catch (error) {
    error.name = 'NotFound';
    next(error);
  }
};

module.exports = {
  getAllPets,
  getPetById,
  addNewPet,
  updatePet,
  deletePet
};
