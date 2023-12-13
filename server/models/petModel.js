const mongoose = require('mongoose');

// pet needs schema
const needsSchema = new mongoose.Schema({
  needType: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 1000
  },
  frequency: {
    type: String,
    maxlength: 50
  },
  quantity: {
    type: String,
    maxlength: 50
  },
  duration: {
    type: String,
    maxlength: 50
  },
  careRecord: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      careTaker: { // user id, later will be connected to user model
        type: String,
        maxlength: 50
      },
      note: {
        type: String,
        maxlength: 1000
      }
    }
  ]
});


// pet schema
const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  breed: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 1000
  },
  birthDay: {
    type: Date
  },
  needs: [needsSchema]
});



const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;