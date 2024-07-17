require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development'; // True if development mode
const isProduction = process.env.NODE_ENV === 'production'; // True if production mode
const isTesting = process.env.NODE_ENV === 'testing'; // True if testing mode
const mongodbUri = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_MONGODB_URI : process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_MONGODB_URI : process.env.TEST_MONGODB_URI;
const backendPort = process.env.PORT || 3000; // Port for backend server
const jwtSecret = process.env.JWT_SECRET;
const allowedOrigins = process.env.ALLOWED_ORIGINS;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailService = process.env.EMAIL_SERVICE;
const emailPort = process.env.EMAIL_PORT;

module.exports = {
  isDevelopment,
  isProduction,
  isTesting,
  mongodbUri,
  backendPort,
  jwtSecret,
  allowedOrigins,
  emailUser,
  emailPass,
  emailService,
  emailPort,
};
