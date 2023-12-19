const mongoose = require('mongoose');
const User = require('./userModel');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
  },
  species: {
    type: String,
    minlength: 3,
    maxlength: 30,
  },
  breed: {
    type: String,
    minlength: 3,
    maxlength: 30,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  birthday: {
    type: Date,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  careTakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  needs: [{
    category: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    frequency: { // Number of times per day, week, month, year
      times: {
        type: Number,
        min: 1,
      },
      periodicity: {
        unit: {
          type: String,
          enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
        },
        interval: { // How often in the unit
          type: Number,
          min: 1,
        },
        customIntervalDays: {
          type: Number,
          min: 1,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        nextReminder: {
          type: Date,
        },
        active: {
          type: Boolean,
          default: true,
        },
      },
    },
    quantity: {
      value: {
        type: Number,
      },
      unit: { // For measurement unit
        type: String,
        maxlength: 20,
      },
    },
    duration: {
      timeLength: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ['second', 'seconds', 'minute', 'minutes', 'hour', 'hours'],
      },
    },
    completed: { // Automatically changes when all tasks of this need are completed -- logic need to be implemented
      type: Boolean,
      default: false,
    },
    careRecord: [
      {
        date: {
          type: Date,
        },
        careTaker: { // User id, later will be connected to user model
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: {
          type: String,
          maxlength: 200,
        },
      },
    ],
    archived: { // When date is past, set to true
      type: Boolean,
      default: false,
    },
  }],
});

petSchema.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString(); // Change the _id property of the returned object to string id

    delete returnedObject._id;
    delete returnedObject.__v;

    if (returnedObject.birthday) {
      returnedObject.birthday = returnedObject.birthday.toISOString().split('T')[0]; // Yyyy-mm-dd
    }

    if (returnedObject.needs) { // Change needs _id to string id
      returnedObject.needs.forEach(need => {
        if (need._id) {
          need.id = need._id.toString();
          delete need._id;
        }
      });
    }
  },
});

const Pet = mongoose.model('Pet', petSchema);

// Custom functions, not included in the model

// add new pet
Pet.addNewPet = async function (pet) {
  const newPet = new Pet(pet);
  try {
    return newPet;
  } catch (error) {
    return error;
  }
};

// Add new need
Pet.addNewNeed = async function (need) {
  const pet = await Pet.findById(this._id);
  if (!pet) {
    return 'no pet';
  }

  pet.needs.push(need);
  try {
    await pet.save();
  } catch (error) {
    return error;
  }
};

// Add new record
Pet.addNewRecord = async function (petId, needId, careTakerId, note) {
  const currentDate = new Date().toISOString().split('T')[0]; // Yyyy-mm-dd

  const pet = await Pet.findById(petId); // Find pet by id

  if (!pet) {
    return 'no pet';
  }

  const need = pet.needs.id(needId); // Find need by id

  if (!need || need.archived) {
    return 'no need';
  }

  const careTaker = await User.findById(careTakerId); // Find care taker by id

  if (!careTaker) {
    return 'no user';
  }

  if (!pet.careTakers.includes(careTaker._id)) {
    return 'not a care taker';
  }

  const newRecord = {
    date: currentDate,
    careTaker,
    note,
  };

  try {
    need.careRecord.push(newRecord);
    await pet.save();
    return newRecord;
  } catch (error) {
    return error;
  }
};

module.exports = Pet;
