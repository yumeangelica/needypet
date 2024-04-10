const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');
const connectDatabase = require('./database/mongoConnection');
const authenticateToken = require('./middlewares/tokenValidatorMiddleware');
const getUserHandler = require('./middlewares/getUserHandler');
const requestLogger = require('./middlewares/requestLoggerMiddleware');
const errorHandler = require('./middlewares/errorHandlerMiddleware');
const unknownEndpoint = require('./middlewares/unknownEndpointHandler');
const petsRoutes = require('./routes/petRoutes');
const usersRoutes = require('./routes/userRoutes');
const { updatePetNeedstoNextDays } = require('./helper');
const { corsHeaders, corsOptions } = require('./utils/corsConfig');
const helmet = require('helmet');
const { isTesting } = require('./utils/config');

// Middleware
app.use(express.json()); // Json parser for post requests
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger); // Request logger
}

// Connect to database
connectDatabase();

// Cors configuration
app.use(cors(corsOptions));

// Cors headers
app.use(corsHeaders);

// Helmet
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
  noSniff: true,
}));

if (!isTesting) {
  // Run every hour
  cron.schedule('0 * * * *', () => updatePetNeedstoNextDays()); // Check if pet needs needs updated every hour, if midnight, update pet needs
}

// Routes
app.use('/auth', usersRoutes);
app.use('/api', authenticateToken, getUserHandler, petsRoutes);

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>');
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
