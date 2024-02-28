const { mongodbUri } = require('../utils/config');
const mongoose = require('mongoose');

/**
 * @description Connects to the MongoDB database
 */
const connectDatabase = () => {
  mongoose.connect(mongodbUri)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(error => {
      console.log('Error connecting to MongoDB:', error.message);
    });
};

module.exports = connectDatabase;
