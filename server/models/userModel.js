const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const helper = require('../helper');
const crypto = require('crypto');

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
  emailConfirmToken: {
    type: String,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmTokenExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
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

/**
 * @description Method to generate email confirmation token for user
 */
userSchema.methods.generateEmailConfirmToken = function () {
  if (this.emailConfirmed) {
    return;
  }

  const expiresInHours = 2;
  const expirationDate = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
  const token = crypto.randomBytes(20).toString('hex');

  this.emailConfirmToken = token;
  this.emailConfirmTokenExpires = expirationDate;
};

/**
 * @description Method to verify email confirmation token for user
 * @param {*} token
 * @returns true if token is valid
 */
userSchema.methods.verifyEmailConfirmToken = function (token) {
  return this.emailConfirmToken === token && this.emailConfirmTokenExpires.getTime() > Date.now();
};

/**
 * @description Method to check if user has expired email confirmation token
 * @returns true if user can resend verification email
 */
userSchema.methods.canResendVerificationEmail = function () {
  return (this.emailConfirmTokenExpires === null && this.emailConfirmTokenExpires === null) || (this.emailConfirmTokenExpires !== null && Date.now() > this.emailConfirmTokenExpires.getTime());
};

/**
 * @description Method to generate password reset token for user, if they have forgotten password. Sets expiration time for token
 */
userSchema.methods.generatePasswordResetToken = function () {
  const expiresInHours = 2;
  const expirationDate = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
  const token = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = token;
  this.passwordResetExpires = expirationDate;
};

/**
 * @description Method to verify password reset token for user
 * @param {*} token
 * @returns true if token is valid
 */
userSchema.methods.verifyPasswordResetToken = function (token) {
  return this.passwordResetToken === token && this.passwordResetExpires.getTime() > Date.now();
};

/**
 * @description Method to check if user can resend password reset email
 * @returns true if user can resend password reset email
 */
userSchema.methods.canResendPasswordReset = function () {
  return (this.passwordResetToken === null && this.passwordResetExpires === null) || (this.passwordResetExpires !== null && Date.now() > this.passwordResetExpires.getTime());
};

const User = mongoose.model('User', userSchema);

module.exports = User;
