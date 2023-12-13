const mongoose = require('mongoose');

// will be continued

// pet schema
const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40
  },
  breed: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  description: {
    type: String,
    maxlength: 2000
  },
  birthday: {
    type: Date
  },
  needs: [{
    category: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50
    },
    description: {
      type: String,
      maxlength: 1000
    },
    frequency: { // number of times per day, week, month, year
      times: {
        type: Number,
        min: 1
      },
      periodicity: {
        unit: {
          type: String,
          enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
        },
        interval: { // how often in the unit
          type: Number,
          min: 1,
        },
        customIntervalDays: {
          type: Number,
          min: 1
        },
        startDate: {
          type: Date
        },
        endDate: {
          type: Date
        },
        nextReminder: {
          type: Date
        },
        active: {
          type: Boolean,
          default: true
        }
      },
    },
    quantity: {
      value: {
        type: Number
      },
      unit: { // for measurement unit
        type: String,
        maxlength: 20
      }
    },
    duration: {
      timeLength: {
        type: Number
      },
      unit: {
        type: String,
        enum: ['seconds', 'minutes', 'hours']
      }
    },
    completed: { // automatically changes when all tasks of this need are completed -- logic need to be implemented
      type: Boolean,
      default: false
    },
    careRecord: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        careTaker: { // user id, later will be connected to user model
          type: String,
          maxlength: 30
        },
        note: {
          type: String,
          maxlength: 200
        }
      }
    ]
  }]
});

// custom methods

// petSchema.methods.checkIfNeedCompleted = async function (needId) {
//   // check if needId is completed via careRecord length === quantity
//   const pet = await Pet.findById(this._id);
//   if (!pet) {
//     return "no pet"
//   }
//   const need = pet.needs.id(needId);
//   if (!need) {
//     return "no need"
//   }
//   const careRecordLength = need.careRecord.length;
//   const quantity = need.quantity.value;
//   return careRecordLength === quantity; // true or false
// }


const Pet = mongoose.model('Pet', petSchema);


// custom functions

// add new pet
Pet.addNewPet = async function (pet) {
  const newPet = new Pet(pet);
  try {
    await newPet.save();
    return newPet;
  } catch (error) {
    return error;
  }
}

// add new need
Pet.addNewNeed = async function (need) {
  const pet = await Pet.findById(this._id);
  if (!pet) {
    return "no pet"
  }
  pet.needs.push(need);
  try {
    await pet.save();
  } catch (error) {
    return error;
  }
  
}

// add new record
Pet.addNewRecord = async function (needId, record) {
  const currentDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  const newRecord = {
    date: currentDate,
    careTaker: record.careTaker,
    note: record.note
  };
  const pet = await Pet.findById(this._id);
  if (!pet) {
    return "no pet"
  }
  const need = pet.needs.id(needId);
  if (!need) {
    return "no need"
  }
  need.careRecord.push(newRecord);
  try {
    await pet.save();
  } catch (error) {
    return error;
  }
}



module.exports = Pet;