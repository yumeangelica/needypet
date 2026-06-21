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
const dbReady = require('./middlewares/dbReadyMiddleware');
const {
  authLimiter,
  emailLimiter,
} = require('./middlewares/rateLimitMiddleware');
const petsRoutes = require('./routes/petRoutes');
const usersRoutes = require('./routes/userRoutes');
const { updatePetNeedstoNextDays } = require('./helper');
const { corsHeaders, corsOptions } = require('./utils/corsConfig');
const helmet = require('helmet');
const { isTesting, isProduction, allowedOrigins } = require('./utils/config');
const path = require('node:path');

// Middleware
app.use(express.json()); // Json parser for post requests
if (!isTesting) {
  app.use(requestLogger); // Request logger
}

// Connect to database
connectDatabase();

// Cors configuration
app.use(cors(corsOptions));

// Cors headers
app.use(corsHeaders);

// Helmet
app.use(
  helmet({
    referrerPolicy: { policy: 'no-referrer' },
    noSniff: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", ...allowedOrigins],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

if (!isTesting) {
  // Run every hour
  cron.schedule('0 * * * *', () => updatePetNeedstoNextDays()); // Check if pet needs needs updated every hour, if midnight, update pet needs
}

// Routes
// Stricter limit on the email-sending endpoints, then a general auth limiter.
app.use('/auth/request-password-reset', emailLimiter);
app.use('/auth/resend-email-confirmation', emailLimiter);
app.use('/auth', authLimiter, dbReady, usersRoutes);
app.use('/api', dbReady, authenticateToken, getUserHandler, petsRoutes);

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('{*path}', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
