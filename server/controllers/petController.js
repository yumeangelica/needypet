let pets = require('../database/mockDataConnection') // temporary mock data for pets, later I will use mongodb

// get all pets
const getAllPets = (request, response) => {
  response.json(pets)
}

// get pet by id
const getPetById = (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const pet = pets.find(pet => pet.id === id);

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
const addNewPet = (request, response, next) => {
  try {
    const pet = request.body;

    if (!pet.petName) {
      throw new Error('Content missing');
    }

    pets = pets.concat(pet);
    response.json(pet);
  } catch (error) {
    error.name = 'BadRequest';
    next(error);
  }
};

// delete pet
const deletePet = (request, response) => {
  const id = Number(request.params.id);
  pets = pets.filter(pet => pet.id !== id);
  response.status(204).end();
};



module.exports = {
  getAllPets,
  getPetById,
  addNewPet,
  deletePet
}