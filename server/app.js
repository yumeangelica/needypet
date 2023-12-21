const express = require('express');
const cors = require('cors');
const app = express();
const connectDatabase = require('./database/mongoConnection');
// Outcommented for testing purposes
// const authenticateToken = require('./middlewares/tokenValidatorMiddleware');
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

// Routes
app.use('/auth', usersRoutes);

// Outcommented, enable if needed for testing purposes
app.use('/api', petsRoutes); // No authentication needed for this route

// Outcommented for testing purposes
// app.use('/api', authenticateToken, petsRoutes);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
