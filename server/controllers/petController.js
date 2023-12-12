let pets = require('../database/mockDataConnection') // temporary mock data for pets, later I will use mongodb

// get all pets
const getAllPets = (request, response) => {
  response.json(pets)
}

// get pet by id
const getPetById = (request, response) => {

  const id = Number(request.params.id)
  const pet = pets.find(pet => pet.id === id)
  if (pet) {
    response.json(pet)
  } else {
    response.status(404).end()
  }
}

// add new pet
const addNewPet = (request, response) => {
  const pet = request.body
  if (pet.petName === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  pets = pets.concat(pet)
  response.json(pet)
}

// delete pet
const deletePet = (request, response) => {
  const id = Number(request.params.id)
  pets = pets.filter(pet => pet.id !== id)
  response.status(204).end()
}



module.exports = {
  getAllPets,
  getPetById,
  addNewPet,
  deletePet
}