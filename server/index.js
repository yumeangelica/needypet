const app = require('./app');
const { backendPort } = require('./utils/config');

// Listen
app.listen(backendPort, () => {
  console.log(`Server running on port ${backendPort}`);
});

