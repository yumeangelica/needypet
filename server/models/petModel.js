const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
        emit: ['ml', 'g'],
      },
    },
    duration: {
      value: {
        type: Number,
        max: 1440, // 24 hours
      },
      unit: {
        type: String,
        emit: ['minute', 'minutes'],
      },
    },
    completed: { // Automatically changes when all tasks of this need are completed -- logic need to be implemented
      type: Boolean,
      default: false,
    },
    careRecords: [{
      date: {
        type: Date,
      },
      careTaker: { // User id, later will be connected to user model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      note: {
        type: String,
        maxlength: 300,
      },
      quantity: {
        value: {
          type: Number,
        },
        unit: { // For measurement unit
          type: String,
          maxlength: 20,
          emit: ['ml', 'g'],
        },
      },
      duration: {
        value: {
          type: Number,
          max: 1440, // 24 hours
        },
        unit: {
          type: String,
          emit: ['minute', 'minutes'],
        },
      },
    }],
    archived: { // When date is past, set to true
      type: Boolean,
      default: false,
    },
  }],
});

petSchema.plugin(uniqueValidator);

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

        if (need.careRecords) { // Change careRecords _id to string id
          need.careRecords.forEach(record => {
            if (record._id) {
              record.id = record._id.toString();
              delete record._id;
            }
          });
        }
      });
    }
  },
});

const Pet = mongoose.model('Pet', petSchema);

// Custom functions, not included in the model

// Add new pet
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

module.exports = Pet;
