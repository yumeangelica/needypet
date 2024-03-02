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
const { petNeedstoNextDays } = require('./helper');
const { corsHeaders, corsOptions } = require('./utils/corsConfig');

// For dev purposes
const { getAllPets } = require('./controllers/petController');
const { getAllUsers } = require('./controllers/userController');

// Middleware
app.use(express.json()); // Json parser for post requests
app.use(requestLogger);

// Connect to database
connectDatabase();

// Cors configuration
app.use(cors(corsOptions));

// Cors headers
app.use(corsHeaders);

// Run every hour
cron.schedule('0 * * * *', () => petNeedstoNextDays());

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>');
});

// For dev purposes
app.get('/dev/pets', getAllPets);
app.get('/dev/users', getAllUsers);

// Routes
app.use('/auth', usersRoutes); // No authentication needed for this route - only for testing purposes
app.use('/api', authenticateToken, getUserHandler, petsRoutes); // No authentication needed for this route - only for testing purposes

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
