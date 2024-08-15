const Pet = require('../models/petModel');
const User = require('../models/userModel');
const { dailyTaskCompleter, checkLocalDateByTimezone } = require('../helper');
const needValidation = require('../validations/needValidation');
const recordValidation = require('../validations/recordValidation');
const z = require('zod');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

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
  try {
    request.body.need.dateFor = new Date(request.body.need.dateFor.slice(0, 10));
    const validateNeed = needValidation(request.body.need);
    const pet = request.pet;

    if (pet.needs.filter(need => need.dateFor.toISOString().split('T')[0] === validateNeed.dateFor.toISOString().split('T')[0]).length >= 10) {
      return response.status(400).json({ error: 'Maximum number of needs for the day reached' });
    }

    const newNeedObject = {
      dateFor: validateNeed.dateFor,
      category: validateNeed.category,
      description: validateNeed.description,
    };

    if (validateNeed.quantity) {
      newNeedObject.quantity = validateNeed.quantity;
    }

    if (validateNeed.duration) {
      newNeedObject.duration = validateNeed.duration;
    }

    pet.needs.push(newNeedObject);

    await pet.save();
    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: error.flatten() });
    }

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
  try {
    const validateRecord = recordValidation(request.body);

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

    const newRecordObject = {
      careTaker: request.user.id,
      date: new Date(dayjs().tz(request.user.timezone).format()),
      note: validateRecord.note,
      timezone: request.user.timezone,
    };

    if (validateRecord.quantity) {
      newRecordObject.quantity = validateRecord.quantity;
    }

    if (validateRecord.duration) {
      newRecordObject.duration = validateRecord.duration;
    }

    need.careRecords.push(newRecordObject);
    dailyTaskCompleter(need);
    await pet.save();
    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: error.flatten() });
    }

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
