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
const corsOptions = require('./utils/corsConfig');

// For dev purposes
const { getAllPets } = require('./controllers/petController');
const { getAllUsers } = require('./controllers/userController');

let isPetNeedsUpdating = false;

// Middleware
app.use(express.json()); // Json parser for post requests
app.use(requestLogger);

// Cors configuration
app.use(cors(corsOptions));

// Connect to database
connectDatabase();

// Run every hour
cron.schedule('0 * * * *', async () => {
  isPetNeedsUpdating = true;
  await petNeedstoNextDays();
  isPetNeedsUpdating = false;
});

// Middleware for maintenance, check if pet needs are updating
app.use((request, response, next) => {
  if (isPetNeedsUpdating) {
    return response.status(503).send('Server is updating pet needs');
  }

  next();
});

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>');
});

// For dev purposes
app.get('/api/pets', getAllPets);
app.get('/auth/users', getAllUsers);

// Routes
app.use('/auth', usersRoutes); // No authentication needed for this route - only for testing purposes
app.use('/api', authenticateToken, getUserHandler, petsRoutes); // No authentication needed for this route - only for testing purposes

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
