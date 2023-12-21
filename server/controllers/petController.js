const Pet = require('../models/petModel');
const User = require('../models/userModel');

// Get all pets
const getAllPets = async (request, response) => {
  try {
    const pets = await Pet.find({}).populate('owner', 'userName').populate('careTakers', 'userName');
    response.json(pets);
  } catch (error) {
    console.log('error getting pets');
    console.log(error);
  }
};

// Get pet by id
const getPetById = async (request, response, next) => {
  const { id } = request.params;

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

// Add new pet
const addNewPet = async (request, response, next) => {
  const newPetObject = {
    name: request.body.name,
    breed: request.body.breed,
    description: request.body.description,
    birthday: request.body.birthday,
    owner: '',
    careTakers: [],
  };

  const owner = await User.findById(request.body.owner); // Find owner by id

  if (!owner) {
    return 'no user';
  }

  newPetObject.owner = owner.id;

  newPetObject.careTakers.push(owner.id); // Owner is also a care taker

  let careTaker;

  if (request.body.careTaker !== owner) {
    careTaker = await User.findById(request.body.careTaker); // Find care taker by id

    if (!careTaker) {
      return 'no user';
    }

    if (!newPetObject.careTakers.includes(careTaker.id)) { // If care taker is not in care takers array
      newPetObject.careTakers.push(careTaker.id);
    }
  }

  try {
    const pet = new Pet(newPetObject); // Creating new pet
    await pet.save();

    if (!owner.pets.includes(pet.id)) {
      owner.pets.push(pet.id); // Adding pet to owner's pets array
      await owner.save();
    }

    response.status(201).json(pet);
  } catch (error) {
    next(error);
  }
};

// Update pet by id
const updatePet = async (request, response, next) => {
  const { id } = request.params;
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

// Delete pet by id
const deletePet = async (request, response, next) => {
  const { id } = request.params;

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

const addNewNeed = async (request, response, next) => {
  const petId = request.params.id;

  const pet = await Pet.findById(petId); // Find pet by id

  if (!pet) {
    return response.status(404).json({ error: 'Pet not found' });
  }

  const adderUser = await User.findById(request.body.adderId); // Find adderUser by id

  if (!adderUser) {
    return response.status(404).json({ error: 'User not found' });
  }

  if (adderUser.id.toString() !== pet.owner.toString()) { // Check if adderUser from request is the owner of the pet. Id comes from mongoose object, so it needs to be converted to string
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const newNeedObject = {
    category: request.body.need.category,
    description: request.body.need.description,
  };

  if (request.body.need.quantity) { // If quantity is provided
    newNeedObject.quantity = {
      value: request.body.need.quantity.value,
      unit: request.body.need.quantity.unit,
    };
  } else if (request.body.need.duration) { // If duration is provided
    newNeedObject.duration = {
      timeLength: request.body.need.duration.timeLength,
      unit: request.body.need.duration.unit,
    };
  }

  pet.needs.push(newNeedObject);

  try {
    await pet.save();
    response.status(201).json(pet);
  } catch (error) {
    next(error);
  }
};

const addNewRecord = async (request, response, next) => {
  const petId = request.params.id;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return response.status(404).json({ error: 'Pet not found' });
  }

  const need = pet.needs.id(request.body.needId);

  if (!need) {
    return response.status(404).json({ error: 'Need not found' });
  }

  const careTaker = await User.findById(request.body.careTakerId);

  if (!careTaker) {
    return response.status(404).json({ error: 'User not found' });
  }

  if (!pet.careTakers.includes(careTaker.id)) { // Check if care taker is in care takers array
    return response.status(401).json({ error: 'Unauthorized' });
  }

  if (need.quantity.value && need.quantity.unit && !request.body.quantity.value && !request.body.quantity.unit) { // If pet need has quantity and request body doesn't
    return response.status(400).json({ error: 'Quantity required' });
  }

  if (need.duration.timeLength && need.duration.unit && !request.body.duration.timeLength && !request.body.duration.unit) { // If pet need has duration and request body doesn't
    return response.status(400).json({ error: 'Duration required' });
  }

  const newRecordObject = {
    careTaker: careTaker.id,
    date: new Date(),
    note: request.body.note,
  };

  if (need.quantity && request.body.quantity) { // If quantity is provided
    newRecordObject.quantity = {
      value: request.body.quantity.value,
      unit: request.body.quantity.unit,
    };
  } else if (need.duration && request.body.duration) { // If duration is provided
    newRecordObject.duration = {
      timeLength: request.body.duration.timeLength,
      unit: request.body.duration.unit,
    };
  }

  need.careRecords.push(newRecordObject); // Push new record to care records array

  try {
    await pet.save();
    response.status(201).json(pet);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPets,
  getPetById,
  addNewPet,
  updatePet,
  deletePet,
  addNewNeed,
  addNewRecord,
};
