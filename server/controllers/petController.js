const Pet = require('../models/petModel');
const User = require('../models/userModel');
const { dailyTaskCompleter, checkLocalDateByTimezone } = require('../helper');
const moment = require('moment-timezone');

/**
 * @description Gets all pets for the user.
 * Includes careTakers if the user is the owner.
 * Filters and returns past and upcoming needs.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const getAllUserPets = async (request, response, next) => {
  try {
    const user = request.user; // User obj is attached to the request object by getUserHandler middleware

    const pets = (await Pet.find({ $or: [{ owner: user.id }, { careTakers: user.id }] }) // Find all pets that the user is the owner or care taker
      .populate('needs')
      .populate('owner', 'userName')
      .populate('careTakers', 'userName')).map(pet => {
      // Remove the caretakers list if the user is not the owner
      if (pet.owner._id.toString() !== user.id.toString()) {
        // Return only the user in careTakers list
        pet.careTakers = pet.careTakers.filter(careTaker => careTaker._id.toString() === user.id.toString());
      }

      return pet;
    });

    response.json(pets);
  } catch (error) {
    console.log('error getting user pets');
    next(error);
  }
};

/**
 * @description Creates a new pet
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const addNewPet = async (request, response, next) => {
  const newPetObject = {
    name: request.body.name || '',
    breed: request.body.breed || '',
    description: request.body.description || '',
    species: request.body.species || '',
    birthday: request.body.birthday || '',
    owner: '',
    careTakers: [],
  };

  const owner = request.user; // Owner is the user who is making the request

  newPetObject.owner = owner.id;

  let careTaker;

  if (request.body.careTaker && request.body.careTaker !== owner) {
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

/**
 * @description Updates pet by id
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const updatePet = async (request, response, next) => {
  const { name, species, breed, description, birthday, careTakers } = request.body;

  // eslint-disable-next-line prefer-const
  let updateData = {
    name: name ? name : request.pet.name,
    species: species ? species : request.pet.species,
    breed: breed ? breed : request.pet.breed,
    description: description ? description : request.pet.description,
    birthday: birthday ? birthday : request.pet.birthday,
    careTakers: careTakers ? careTakers : request.pet.careTakers,
  };

  if (careTakers) {
    // Add pet id to care takers pets array
    await User.updateMany(
      { _id: { $in: careTakers } },
      { $addToSet: { pets: request.pet.id } },
    );
  }

  try {
    const updatedPet = await Pet.findOneAndUpdate({ // Finds pet by id, validates by owner and updates it
      _id: request.pet.id,
      owner: request.user.id,
    }, updateData, { new: true, runValidators: true });

    if (!updatedPet) {
      return response.status(404).json({ error: 'Pet not found' });
    }

    response.json(updatedPet);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @description Deletes pet by id
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const deletePet = async (request, response, next) => {
  try {
    const deletedPet = await Pet.findOneAndDelete({
      _id: request.pet.id,
      owner: request.user.id,
    }, { runValidators: true });

    if (deletedPet === null) {
      return response.status(404).json({ error: 'Pet not found' });
    }

    // Remove pet from owner's pets array
    await User.updateMany(
      { pets: request.pet.id },
      { $pull: { pets: request.pet.id } },
    );

    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * @description Adds a new need to the pet
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const addNewNeed = async (request, response, next) => {
  const pet = request.pet;

  const dateFor = new Date(request.body.need.dateFor.slice(0, 10)); // If date has time, remove it, format it to Yyyy-mm-dd

  if (request.body.need.dateFor && dateFor < new Date().setHours(0, 0, 0, 0)) {
    return response.status(400).json({ error: 'Date for need cannot be in the past' });
  }

  if (request.body.need.quantity && !request.body.need.quantity.unit) {
    return response.status(400).json({ error: 'Quantity unit required' });
  }

  if (request.body.need.quantity && !request.body.need.quantity.value) {
    return response.status(400).json({ error: 'Quantity value required' });
  }

  if (request.body.need.quantity && request.body.need.quantity.unit !== 'ml' && request.body.need.quantity.unit !== 'g') {
    return response.status(400).json({ error: 'Quantity unit ml or g required' });
  }

  if (request.body.need.duration && !request.body.need.duration.unit) {
    return response.status(400).json({ error: 'Duration unit required' });
  }

  if (request.body.need.duration && !request.body.need.duration.value) {
    return response.status(400).json({ error: 'Duration time length required' });
  }

  if (request.body.need.duration && request.body.need.duration.value > 1440) {
    return response.status(400).json({ error: 'Duration time length cannot be over 1440 minutes' });
  }

  if (request.body.need.duration && request.body.need.duration.unit !== 'minutes') {
    return response.status(400).json({ error: 'Duration unit minute(s) required ' });
  }

  const newNeedObject = {
    dateFor,
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
      value: request.body.need.duration.value,
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

/**
 * @description Adds a new record to the pet need
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const addNewRecord = async (request, response, next) => {
  const pet = request.pet; // Pet comes from request.pet, which is attached to the request object by getPetHandler middleware

  const need = pet.needs.id(request.params.needid);

  if (!need) {
    return response.status(404).json({ error: 'Need not found' });
  }

  if (need.completed) {
    return response.status(400).json({ error: 'Need is already completed' });
  }

  if (need.archived) {
    return response.status(400).json({ error: 'Need is archived' });
  }

  const currentDate = checkLocalDateByTimezone(request.user.timezone);
  if (need.dateFor.toISOString().split('T')[0] !== currentDate) {
    return response.status(400).json({ error: 'Need date is not the same as the current date' });
  }

  if (request.body.quantity && !request.body.quantity.value) { // If pet need has quantity and request body doesn't
    return response.status(400).json({ error: 'Quantity value required' });
  }

  if (request.body.quantity && !request.body.quantity.unit) { // If pet need has quantity and request body doesn't
    return response.status(400).json({ error: 'Quantity unit required' });
  }

  if (request.body.duration && !request.body.duration.value) { // If pet need has duration and request body doesn't
    return response.status(400).json({ error: 'Duration time length required' });
  }

  if (request.body.duration && !request.body.duration.unit) { // If pet need has duration and request body doesn't
    return response.status(400).json({ error: 'Duration unit required' });
  }

  if (request.body.quantity && request.body.quantity.unit !== 'ml' && request.body.quantity.unit !== 'g') { // If quantity unit is not ml or g
    return response.status(400).json({ error: 'Quantity unit ml or g required' });
  }

  if (request.body.duration && request.body.duration.value > 1440) {
    return response.status(400).json({ error: 'Duration time length cannot be over 1440 minutes' });
  }

  if (Object.hasOwn(need, 'quantity') && Object.hasOwn(request.body, 'duration')) {
    return response.status(400).json({ error: `Classification need to be quantity and unit need to be ${need.quantity.unit}` });
  }

  if (Object.hasOwn(need, 'duration') && Object.hasOwn(request.body, 'quantity')) {
    return response.status(400).json({ error: `Classification need to be quantity and unit need to be ${need.quantity.unit}` });
  }

  const newRecordObject = {
    careTaker: request.user.id,
    date: moment().tz(request.user.timezone).format(), // Current date in user's timezone
    note: request.body.note,
  };

  if (need.quantity && request.body.quantity) { // If quantity is provided
    newRecordObject.quantity = {
      value: request.body.quantity.value,
      unit: request.body.quantity.unit,
    };
  } else if (need.duration && request.body.duration) { // If duration is provided
    newRecordObject.duration = {
      value: request.body.duration.value,
      unit: request.body.duration.unit,
    };
  }

  try {
    need.careRecords.push(newRecordObject); // Push new record to care records array
    dailyTaskCompleter(need); // Check if daily task is completed and change need.completed to true if it is
    await pet.save();
    response.status(201).json(pet);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Toggles the need active status
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const toggleNeedisActive = async (request, response, next) => {
  const pet = request.pet;

  const need = pet.needs.id(request.params.needid);

  if (!need) {
    return response.status(404).json({ error: 'Need not found' });
  }

  need.isActive = !need.isActive;

  try {
    await pet.save();
    response.json(pet);
  } catch (error) {
    next(error);
  }
};

const updateNeed = async (request, response, next) => {
  const pet = request.pet;

  const need = pet.needs.id(request.params.needid);

  if (!need) {
    return response.status(404).json({ error: 'Need not found' });
  }

  const updateDataObject = {
    category: request.body.category ? request.body.category : need.category,
    description: request.body.description ? request.body.description : need.description,
    dateFor: need.dateFor,
    isActive: need.isActive,
    archived: need.archived,
    completed: need.completed,
    careRecords: need.careRecords,
  };

  if (request.body.quantity) {
    updateDataObject.quantity = {
      value: request.body.quantity.value,
      unit: request.body.quantity.unit,
    };
  } else if (request.body.duration) {
    updateDataObject.duration = {
      value: request.body.duration.value,
      unit: request.body.duration.unit,
    };
  }

  try {
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: request.pet.id, owner: request.user.id, 'needs._id': need.id },
      { $set: { 'needs.$': { ...updateDataObject, _id: need.id } } },
      { runValidators: true, new: true },
    );

    if (!updatedPet) {
      return response.status(404).json({ error: 'Pet\'s need not found' });
    }

    response.status(200).json(updatedPet);
  } catch (error) {
    next(error);
  }
};

const deleteNeed = async (request, response, next) => {
  const pet = request.pet;

  const need = pet.needs.id(request.params.needid);

  if (!need) {
    return response.status(404).json({ error: 'Need not found' });
  }

  try {
    pet.needs.remove(need);
    await pet.save();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addNewPet,
  updatePet,
  deletePet,
  addNewNeed,
  addNewRecord,
  updateNeed,
  deleteNeed,
  getAllUserPets,
  toggleNeedisActive,
};
