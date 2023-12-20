const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

// Works only when auth is not required, will be updated later
test('pets are returned as json', async () => {
  await api
    .get('/api/pets')
    .expect(200)
    .expect('Content-Type', /application\/json/);
},
);

afterAll(async () => {
  await mongoose.connection.close();
},
);
