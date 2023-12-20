// Global teardown file for Jest
const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.connection.close();
};
