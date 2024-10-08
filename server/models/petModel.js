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
    minlength: 0,
    maxlength: 30,
  },
  breed: {
    type: String,
    minlength: 0,
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
    required: true,
    ref: 'User',
  },
  careTakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  needs: [{
    dateFor: {
      type: Date,
      required: true,
    },
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
    // Frequency will be used in next version; will be used to generate notifications
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
        emit: 'minutes',
      },
    },
    completed: { // Automatically changes when all tasks of this need are completed -- logic need to be implemented
      type: Boolean,
      default: false,
    },
    careRecords: [{
      date: {
        type: Date, // UTC datetime
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
          emit: 'minutes',
        },
      },
      timezone: { // Format 'Europe/Helsinki', will indicate where the record was created
        type: String,
        required: true,
        default: 'UTC',
        validator(timezone) {
          const timezones = Intl.supportedValuesOf('timeZone');
          return timezones.includes(timezone);
        },
        message: 'Invalid timezone',
      },
    }],
    archived: { // When date is past, set to true
      type: Boolean,
      default: false,
    },
    isActive: { // In case user wants to pause the need
      type: Boolean,
      default: true,
    },
  }],
});

petSchema.plugin(uniqueValidator);

petSchema.set('toJSON', {
  transform(doc, returnedObject) {
    // Convert _id to id
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;

    // Remove the __v field
    delete returnedObject.__v;

    // Format birthday
    if (returnedObject.birthday) {
      returnedObject.birthday = returnedObject.birthday.toISOString().split('T')[0]; // Yyyy-mm-dd
    }

    // Process needs array
    if (returnedObject.needs) {
      returnedObject.needs.forEach(need => {
        // Convert _id to id for each need
        if (need._id) {
          need.id = need._id.toString();
          delete need._id;
        }

        // Format dateFor
        if (need.dateFor) {
          need.dateFor = need.dateFor.toISOString().split('T')[0]; // Yyyy-mm-dd
        }

        // Process careRecords array within each need
        if (need.careRecords) {
          need.careRecords.forEach(record => {
            // Convert _id to id for each care record
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

module.exports = Pet;
