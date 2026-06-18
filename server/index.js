const mongoose = require('mongoose');
const app = require('./app');
const { backendPort } = require('./utils/config');

// Listen
const server = app.listen(backendPort, () => {
  console.log(`Server running on port ${backendPort}`);
});

/**
 * @description Closes the HTTP server and the database connection on shutdown
 * signals (SIGTERM/SIGINT), so in-flight requests can finish before exit.
 * @param {string} signal
 */
const gracefulShutdown = async signal => {
  console.log(`${signal} received, shutting down gracefully`);

  // Force exit if the graceful shutdown hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000).unref();

  try {
    await new Promise((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
    await mongoose.connection.close();
    console.log('HTTP server and MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

