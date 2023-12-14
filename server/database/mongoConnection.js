require('dotenv').config();
const mongoose = require('mongoose');

const connectDatabase = () => {
  const mongoUri = process.env.MONGO_URI;

  mongoose.connect(mongoUri)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(error => {
      console.log('Error connecting to MongoDB:', error.message);
    });
}

module.exports = connectDatabase;