require('dotenv').config();

// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development'; // True if development mode
const isProduction = process.env.NODE_ENV === 'production'; // True if production mode
const isTesting = process.env.NODE_ENV === 'testing'; // True if testing mode
const mongodbUri = process.env.NODE_ENV === 'testing' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI; // MongoDB URI based on environment
const backendPort = process.env.BACKEND_PORT;
const jwtSecret = process.env.JWT_SECRET;
const allowedOrigins = process.env.ALLOWED_ORIGINS;

module.exports = {
  isDevelopment,
  isProduction,
  isTesting,
  mongodbUri,
  backendPort,
  jwtSecret,
  allowedOrigins,
};
