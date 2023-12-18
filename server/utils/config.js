require('dotenv').config();

const config = {
  isDevelopment: process.env.NODE_ENV === 'development', // true if development mode
  isProduction: process.env.NODE_ENV === 'production', // true if production mode
  databaseUrl: process.env.MONGO_URI,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET
};

module.exports = config;
