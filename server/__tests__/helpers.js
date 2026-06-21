const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

/**
 * Registers a user and logs in, returning the auth token and the user's id.
 * Each caller should pass a unique userName/email to avoid unique-index clashes
 * (collections are cleared between tests, but within a test users must differ).
 *
 * @param {object} [overrides] - partial user fields to override the defaults
 * @returns {Promise<{ token: string, id: string, userName: string, email: string, password: string }>}
 */
const registerAndLogin = async (overrides = {}) => {
  const user = {
    userName: 'testUser',
    email: 'test@example.com',
    newPassword: 'TestPass123!',
    timezone: 'Europe/Helsinki',
    ...overrides,
  };

  await api.post('/auth/users').send(user);

  const loginResponse = await api
    .post('/auth/login')
    .send({ userName: user.userName, password: user.newPassword });

  return {
    token: loginResponse.body.token,
    id: loginResponse.body.user.id,
    userName: user.userName,
    email: user.email,
    password: user.newPassword,
  };
};

/**
 * Creates a pet for the given token and returns the created pet body.
 *
 * @param {string} token - auth token of the owner
 * @param {object} [pet] - partial pet fields to override the defaults
 * @returns {Promise<object>} the created pet (response body)
 */
const createPet = async (token, pet = {}) => {
  const response = await api
    .post('/api/pets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Milo', species: 'Cat', breed: 'Tabby', ...pet });

  return response.body;
};

/**
 * Creates a pet with a single duration need and returns { petId, needId, pet }.
 * The need's dateFor defaults to today so that record-related flows are valid.
 *
 * @param {string} token - auth token of the owner
 * @param {object} [need] - partial need fields to override the defaults
 * @returns {Promise<{ petId: string, needId: string, pet: object }>}
 */
const createPetWithNeed = async (token, need = {}) => {
  const pet = await createPet(token);

  const today = new Date().toISOString().slice(0, 10);
  const needResponse = await api
    .post(`/api/pets/${pet.id}/newneed`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      need: {
        category: 'Walk',
        description: 'Morning walk',
        dateFor: today,
        duration: { value: 40, unit: 'minutes' },
        ...need,
      },
    });

  const needList = needResponse.body.needs;
  const needId = needList[needList.length - 1].id;

  return { petId: pet.id, needId, pet: needResponse.body };
};

module.exports = { api, registerAndLogin, createPet, createPetWithNeed };
