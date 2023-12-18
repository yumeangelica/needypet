const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 40
  },
  passwordHash: {
    type: String
  },
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  }]
});



userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() // change the _id property of the returned object to string id
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})



// custom schema methods for the User model

// method to set passwordHash in register
userSchema.methods.setPassword = function setPassword(password) {
  const saltRounds = 10;
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

// method to check if password is correct in login
userSchema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash); // returns true if password is correct
};

// method to generate JWT token for user in login
userSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    userName: this.userName,
    id: this._id
  }, config.jwtSecret, { expiresIn: '1h' }); // token expires in 1 hour
};



const User = mongoose.model('User', userSchema);

module.exports = User;