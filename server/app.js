const express = require('express');
const cors = require('cors');
const app = express();
const connectDatabase = require('./database/mongoConnection');
const authenticateToken = require('./middlewares/tokenValidatorMiddleware');
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

// App.use('/api', petsRoutes) // No authentication needed for this route, enable for testing if needed
app.use('/api', authenticateToken, petsRoutes);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
