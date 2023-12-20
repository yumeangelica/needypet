const app = require('./app');
const config = require('./utils/config');

// Listen
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

