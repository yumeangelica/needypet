const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = () => {
  const mongoUri = process.env.MONGO_URI;

  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(error => {
      console.log('Error connecting to MongoDB:', error.message);
    });
}

module.exports = connectDatabase;