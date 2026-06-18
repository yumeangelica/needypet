const { mongodbUri } = require('../utils/config');
const mongoose = require('mongoose');

// Connection event logging for observability. The dbReady middleware already
// fails fast with 503 when the connection is not ready, so these are logs only.
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

/**
 * @description Connects to the MongoDB database
 */
const connectDatabase = () => {
  mongoose
    .connect(mongodbUri)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB:', error.message);
    });
};

module.exports = connectDatabase;
