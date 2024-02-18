require('dotenv').config();

/**
 * @description Configuration object
 */
const config = {
  isDevelopment: process.env.NODE_ENV === 'development', // True if development mode
  isProduction: process.env.NODE_ENV === 'production', // True if production mode
  databaseUrl: process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;
