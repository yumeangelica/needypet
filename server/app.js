const express = require('express');
const cors = require('cors');
const app = express();
const connectDatabase = require('./database/mongoConnection');
const authenticateToken = require('./middlewares/tokenValidatorMiddleware');
const getUserHandler = require('./middlewares/getUserHandler');
const requestLogger = require('./middlewares/requestLoggerMiddleware');
const errorHandler = require('./middlewares/errorHandlerMiddleware');
const unknownEndpoint = require('./middlewares/unknownEndpointHandler');
const petsRoutes = require('./routes/petRoutes');
const usersRoutes = require('./routes/userRoutes');

// Middleware
app.use(express.json()); // Json parser for post requests
app.use(requestLogger);
app.use(cors());

// Connect to database
connectDatabase();

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>');
});

// For dev purposes
app.get('/api/pets', require('./controllers/petController'));
app.get('/auth/users', require('./controllers/userController'));

// Routes
app.use('/auth', usersRoutes); // No authentication needed for this route - only for testing purposes
app.use('/api', authenticateToken, getUserHandler, petsRoutes); // No authentication needed for this route - only for testing purposes

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
