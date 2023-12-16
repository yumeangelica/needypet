const config = require('../utils/config');
const mongoose = require('mongoose');

const connectDatabase = () => {

  mongoose.connect(config.databaseUrl)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(error => {
      console.log('Error connecting to MongoDB:', error.message);
    });
}

module.exports = connectDatabase;