const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const helper = require('../helper');

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
    validate: {
      validator: helper.tzIdentifierChecker,
      message: 'Invalid timezone',
    },
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

/**
 * @description Method to set password for user in registration
 * @param {*} password
 */
userSchema.methods.setPassword = function (password) {
  const saltRounds = 10;
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

/**
 * @description Method to check if the password is valid for user in login
 * @param {*} password
 * @returns true if password is correct
 */
userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

/**
 * @description Method to generate JWT token for user in login
 * @returns JWT token for user
 */
userSchema.methods.generateJWT = function () {
  return jwt.sign({
    userName: this.userName,
    id: this._id,
    // eslint-disable-next-line quotes
  }, config.jwtSecret, { expiresIn: "10h" });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
