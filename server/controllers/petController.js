const Pet = require('../models/petModel');
const User = require('../models/userModel');
const { dailyTaskCompleter, checkLocalDateByTimezone } = require('../helper');
const needValidation = require('../validations/needValidation');
const recordValidation = require('../validations/recordValidation');
const mongoose = require('mongoose');
const z = require('zod');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

const invalidDate = () => new Date(Number.NaN);

const normalizeNeedDateForStorage = (dateFor, ownerTimezone) => {
  if (!(dateFor instanceof Date) && typeof dateFor !== 'string') {
    return invalidDate();
  }

  try {
    const parsedDate = dateOnlyRegex.test(dateFor)
      ? dayjs.tz(dateFor, ownerTimezone)
      : dayjs(dateFor).tz(ownerTimezone);

    if (!parsedDate.isValid()) {
      return invalidDate();
    }

    const [year, month, day] = parsedDate
      .format('YYYY-MM-DD')
      .split('-')
      .map(Number);

    return new Date(Date.UTC(year, month - 1, day));
  } catch (_error) {
    return invalidDate();
  }
};

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

    const pets = (
      await Pet.find({ $or: [{ owner: user._id }, { careTakers: user._id }] }) // Find all pets that the user is the owner or care taker
        .populate('needs')
        .populate('owner', 'userName')
        .populate('careTakers', 'userName')
    ).map((pet) => {
      // Remove the caretakers list if the user is not the owner
      if (pet.owner._id.toString() !== user._id.toString()) {
        // Return only the user in careTakers list
        pet.careTakers = pet.careTakers.filter(
          (careTaker) => careTaker._id.toString() === user._id.toString(),
        );
      }

      return pet;
    });

    response.json(pets);
  } catch (error) {
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

  newPetObject.owner = owner._id;

  let careTaker;

  if (
    request.body.careTaker &&
    request.body.careTaker !== owner._id.toString()
  ) {
    careTaker = await User.findById(request.body.careTaker); // Find care taker by id

    if (!careTaker) {
      return response.status(404).json({ message: 'Caretaker not found' });
    }

    if (!newPetObject.careTakers.includes(careTaker._id)) {
      // If care taker is not in care takers array
      newPetObject.careTakers.push(careTaker._id);
    }
  }

  try {
    const pet = new Pet(newPetObject); // Creating new pet
    await pet.save();

    if (!owner.pets.includes(pet._id)) {
      owner.pets.push(pet._id); // Adding pet to owner's pets array
      await owner.save();
    }

    if (careTaker) {
      // Keep the caretaker's pets array in sync with the pet's careTakers.
      await User.updateMany(
        { _id: careTaker._id },
        { $addToSet: { pets: pet._id } },
      );
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
  const { name, species, breed, description, birthday, careTakers } =
    request.body;

  let normalizedCareTakers = request.pet.careTakers;

  if (careTakers !== undefined) {
    if (!Array.isArray(careTakers)) {
      return response
        .status(400)
        .json({ message: 'Caretakers must be an array' });
    }

    normalizedCareTakers = [
      ...new Set(careTakers.map((careTaker) => String(careTaker))),
    ];

    if (
      normalizedCareTakers.some(
        (careTaker) => !mongoose.Types.ObjectId.isValid(careTaker),
      )
    ) {
      return response
        .status(400)
        .json({ message: 'Caretaker ids must be valid' });
    }

    const existingCareTakers = await User.find({
      _id: { $in: normalizedCareTakers },
    }).select('_id');

    if (existingCareTakers.length !== normalizedCareTakers.length) {
      return response.status(404).json({ message: 'Caretaker not found' });
    }
  }

  const updateData = {
    name: name ? name : request.pet.name,
    species: species ? species : request.pet.species,
    breed: breed ? breed : request.pet.breed,
    description: description ? description : request.pet.description,
    birthday: birthday ? birthday : request.pet.birthday,
    careTakers: normalizedCareTakers,
  };

  try {
    const updatedPet = await Pet.findOneAndUpdate(
      {
        // Finds pet by id, validates by owner and updates it
        _id: request.pet._id,
        owner: request.user._id,
      },
      updateData,
      { returnDocument: 'after', runValidators: true },
    );

    if (!updatedPet) {
      return response.status(404).json({ message: 'Pet not found' });
    }

    // Keep the User <-> Pet caretaker references in sync only after the pet
    // update succeeds (so a non-owner 404 does not mutate user arrays).
    if (careTakers !== undefined) {
      // Add pet id to the new care takers' pets array.
      await User.updateMany(
        { _id: { $in: normalizedCareTakers } },
        { $addToSet: { pets: request.pet._id } },
      );
      // Remove pet id from users who are no longer care takers. The owner is
      // excluded so their own pets reference (managed separately) is preserved.
      await User.updateMany(
        {
          pets: request.pet._id,
          _id: { $nin: [...normalizedCareTakers, request.user._id] },
        },
        { $pull: { pets: request.pet._id } },
      );
    }

    response.json(updatedPet);
  } catch (error) {
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
    const deletedPet = await Pet.findOneAndDelete(
      {
        _id: request.pet._id,
        owner: request.user._id,
      },
      { runValidators: true },
    );

    if (deletedPet === null) {
      return response.status(404).json({ message: 'Pet not found' });
    }

    // Remove pet from owner's pets array
    await User.updateMany(
      { pets: request.pet._id },
      { $pull: { pets: request.pet._id } },
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
    request.body.need.dateFor = normalizeNeedDateForStorage(
      request.body.need.dateFor,
      request.user.timezone,
    );
    const validateNeed = needValidation(request.body.need);
    const pet = request.pet;

    if (
      pet.needs.filter(
        (need) =>
          need.dateFor.toISOString().split('T')[0] ===
          validateNeed.dateFor.toISOString().split('T')[0],
      ).length >= 10
    ) {
      return response
        .status(400)
        .json({ message: 'Maximum number of needs for the day reached' });
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

    // Validate only modified paths (incl. the new need) so unrelated legacy needs
    // that no longer match the current schema do not block this save.
    await pet.save({ validateModifiedOnly: true });
    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: 'Validation error',
        errorDetails: error.flatten().fieldErrors,
      });
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
      return response.status(404).json({ message: 'Need not found' });
    }

    if (need.completed) {
      return response
        .status(400)
        .json({ message: 'Need is already completed' });
    }

    if (need.archived) {
      return response.status(400).json({ message: 'Need is archived' });
    }

    // The need's "day" is defined by the pet owner's timezone (who created it),
    // not the acting caretaker's — otherwise a carer in a different timezone
    // could be wrongly blocked from or allowed to record against it. The pet's
    // owner is a raw ObjectId here (getPetHandler does not populate it), so fetch
    // the owner's timezone, falling back to the caretaker's if unavailable.
    const owner = await User.findById(pet.owner).select('timezone');
    const referenceTimezone = owner?.timezone || request.user.timezone;

    const currentDate = checkLocalDateByTimezone(referenceTimezone);
    if (need.dateFor.toISOString().split('T')[0] !== currentDate) {
      return response
        .status(400)
        .json({ message: 'Need date is not the same as the current date' });
    }

    const newRecordObject = {
      careTaker: request.user._id,
      // The record is stamped in the acting caretaker's timezone (accurate audit
      // of when/where it was logged), independent of the owner's timezone above.
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
    // Validate only modified paths so unrelated legacy needs do not block this save.
    await pet.save({ validateModifiedOnly: true });
    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: 'Validation error',
        errorDetails: error.flatten().fieldErrors,
      });
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
    return response.status(404).json({ message: 'Need not found' });
  }

  need.isActive = !need.isActive;

  try {
    // Validate only the modified path so an unrelated legacy need that no longer
    // matches the current schema does not block this toggle.
    await pet.save({ validateModifiedOnly: true });
    response.json(pet);
  } catch (error) {
    next(error);
  }
};

const updateNeed = async (request, response, next) => {
  const pet = request.pet;

  const need = pet.needs.id(request.params.needid);

  if (!need) {
    return response.status(404).json({ message: 'Need not found' });
  }

  const updateDataObject = {
    category: request.body.category ? request.body.category : need.category,
    description: request.body.description
      ? request.body.description
      : need.description,
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
  } else if (need.quantity?.value) {
    // No measure in the request body: carry over the existing one so a
    // category/description-only update does not wipe the need's measure.
    // (quantity/duration are always-present nested objects, so check .value.)
    updateDataObject.quantity = need.quantity;
  } else if (need.duration?.value) {
    updateDataObject.duration = need.duration;
  }

  try {
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: request.pet._id, owner: request.user._id, 'needs._id': need._id },
      { $set: { 'needs.$': { ...updateDataObject, _id: need._id } } },
      { runValidators: true, returnDocument: 'after' },
    );

    if (!updatedPet) {
      return response.status(404).json({ message: "Pet's need not found" });
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
    return response.status(404).json({ message: 'Need not found' });
  }

  try {
    pet.needs.pull(need._id);
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
