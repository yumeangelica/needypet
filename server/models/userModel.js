const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 40,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 100,
    match: [/\S+@\S+\.\S+/, 'is invalid'], // Formated as email address
  },
  passwordHash: {
    type: String,
  },
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
  }],
  timezone: { // Format 'Europe/Helsinki'
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString(); // Change the _id property of the returned object to string id
    delete returnedObject._id;
    delete returnedObject.__v;
    // The passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

// Custom schema methods for the User model

// method to set passwordHash in register
userSchema.methods.setPassword = function (password) {
  const saltRounds = 10;
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

// Method to check if password is correct in login
userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash); // Returns true if password is correct
};

// Method to generate JWT token for user in login
userSchema.methods.generateJWT = function () {
  return jwt.sign({
    userName: this.userName,
    id: this._id,
  }, config.jwtSecret, { expiresIn: 60 * 30 }); // Token expires in 30 minutes
};

const User = mongoose.model('User', userSchema);

module.exports = User;
