const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const supertest = require('supertest');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const app = require('../app');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');

dayjs.extend(utc);
dayjs.extend(timezone);

const api = supertest(app);

// A valid IANA timezone (Intl.supportedValuesOf does not include 'UTC').
const TEST_TZ = 'Europe/Helsinki';

/**
 * Creates a user directly in the database (bypassing the registration email)
 * and returns the user document together with a valid bearer token.
 */
const createUserWithToken = async ({ userName, email }) => {
  const user = new User({ userName, email, timezone: TEST_TZ });
  await user.setPassword('testPass123!');
  await user.save();
  const token = await user.generateJWT();
  return { user, token };
};

/**
 * Creates a pet owned by the given user, optionally with care takers.
 */
const createPet = async (owner, { name = 'Rex', careTakers = [] } = {}) =>
  Pet.create({ name, owner: owner._id, careTakers });

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await mongoose.connection.close();
});

describe('Pet API', () => {
  let owner;
  let ownerToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});

    const created = await createUserWithToken({
      userName: 'ownerUser',
      email: 'owner@example.com',
    });
    owner = created.user;
    ownerToken = created.token;
  });

  describe('authentication and authorization', () => {
    it('rejects requests without a token with 401', async () => {
      const response = await api.get('/api/pets');
      assert.strictEqual(response.status, 401);
    });

    it('returns 404 for a non-existent pet id', async () => {
      const missingId = new mongoose.Types.ObjectId().toString();
      const response = await api
        .put(`/api/pets/${missingId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'NewName' });
      assert.strictEqual(response.status, 404);
    });

    it('returns 400 for a malformatted pet id', async () => {
      const response = await api
        .put('/api/pets/not-a-valid-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'NewName' });
      assert.strictEqual(response.status, 400);
    });

    it('forbids a non-owner from updating the pet with 401', async () => {
      const pet = await createPet(owner);
      const { token: strangerToken } = await createUserWithToken({
        userName: 'strangerUser',
        email: 'stranger@example.com',
      });

      const response = await api
        .put(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({ name: 'Hacked' });

      assert.strictEqual(response.status, 401);
    });
  });

  describe('GET /api/pets', () => {
    it('returns the pets the user owns', async () => {
      await createPet(owner, { name: 'Buddy' });

      const response = await api
        .get('/api/pets')
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 1);
      assert.strictEqual(response.body[0].name, 'Buddy');
    });

    it('returns pets where the user is a care taker', async () => {
      const { user: caretaker, token: caretakerToken } =
        await createUserWithToken({
          userName: 'caretakerUser',
          email: 'caretaker@example.com',
        });
      await createPet(owner, { name: 'Shared', careTakers: [caretaker._id] });

      const response = await api
        .get('/api/pets')
        .set('Authorization', `Bearer ${caretakerToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 1);
      assert.strictEqual(response.body[0].name, 'Shared');
    });
  });

  describe('POST /api/pets', () => {
    it('creates a new pet for the authenticated owner', async () => {
      const response = await api
        .post('/api/pets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Milo', species: 'cat' });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.name, 'Milo');

      const petsInDb = await Pet.find({ owner: owner._id });
      assert.strictEqual(petsInDb.length, 1);

      const refreshedOwner = await User.findById(owner._id);
      assert.strictEqual(refreshedOwner.pets.length, 1);
    });

    it('returns 422 when the name is too short', async () => {
      const response = await api
        .post('/api/pets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'a' });

      assert.strictEqual(response.status, 422);
    });
  });

  describe('PUT /api/pets/:id', () => {
    it('updates a pet owned by the user', async () => {
      const pet = await createPet(owner, { name: 'OldName' });

      const response = await api
        .put(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'UpdatedName' });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, 'UpdatedName');
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('deletes a pet owned by the user and returns 204', async () => {
      const pet = await createPet(owner);

      const response = await api
        .delete(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.strictEqual(response.status, 204);

      const petInDb = await Pet.findById(pet._id);
      assert.strictEqual(petInDb, null);
    });
  });
});

describe('Pet needs and records API', () => {
  let owner;
  let ownerToken;
  let pet;

  /** Today's date in the user's timezone, as the controller computes it. */
  const today = () => dayjs().tz(TEST_TZ).format('YYYY-MM-DD');

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});

    const created = await createUserWithToken({
      userName: 'needsOwner',
      email: 'needs-owner@example.com',
    });
    owner = created.user;
    ownerToken = created.token;
    pet = await createPet(owner, { name: 'Fido' });
  });

  describe('POST /api/pets/:id/newneed', () => {
    it('adds a new need to the pet', async () => {
      const response = await api
        .post(`/api/pets/${pet._id}/newneed`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          need: {
            dateFor: `${today()}T00:00:00.000Z`,
            category: 'Walk',
            description: 'Morning walk',
            duration: { value: 30, unit: 'minutes' },
          },
        });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.needs.length, 1);
      assert.strictEqual(response.body.needs[0].category, 'Walk');
    });

    it('returns 400 for an invalid need body', async () => {
      const response = await api
        .post(`/api/pets/${pet._id}/newneed`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          need: {
            dateFor: `${today()}T00:00:00.000Z`,
            category: 'a', // too short
            description: 'Invalid',
          },
        });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('POST /api/pets/:id/needs/:needid/newrecord', () => {
    it('adds a record to a need dated today', async () => {
      const need = pet.needs.create({
        dateFor: new Date(`${today()}T00:00:00.000Z`),
        category: 'Feed',
        description: 'Lunch',
        duration: { value: 10, unit: 'minutes' },
      });
      pet.needs.push(need);
      await pet.save();

      const response = await api
        .post(`/api/pets/${pet._id}/needs/${need._id}/newrecord`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ note: 'fed', duration: { value: 10, unit: 'minutes' } });

      assert.strictEqual(response.status, 201);
      const updatedNeed = response.body.needs.find(
        (n) => n.id === need._id.toString(),
      );
      assert.ok(updatedNeed, 'expected the need in the response');
      assert.strictEqual(updatedNeed.careRecords.length, 1);
    });

    it('returns 404 when the need does not exist', async () => {
      const missingNeedId = new mongoose.Types.ObjectId().toString();
      const response = await api
        .post(`/api/pets/${pet._id}/needs/${missingNeedId}/newrecord`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ note: 'x', duration: { value: 10, unit: 'minutes' } });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('PATCH /api/pets/:id/needs/:needid/togglestatus', () => {
    it('toggles the need active status', async () => {
      const need = pet.needs.create({
        dateFor: new Date(`${today()}T00:00:00.000Z`),
        category: 'Walk',
        description: 'Walk',
        duration: { value: 10, unit: 'minutes' },
      });
      pet.needs.push(need);
      await pet.save();

      const response = await api
        .patch(`/api/pets/${pet._id}/needs/${need._id}/togglestatus`)
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.strictEqual(response.status, 200);
      const toggled = response.body.needs.find(
        (n) => n.id === need._id.toString(),
      );
      assert.strictEqual(toggled.isActive, false);
    });
  });

  describe('DELETE /api/pets/:id/needs/:needid', () => {
    it('deletes a need and returns 204', async () => {
      const need = pet.needs.create({
        dateFor: new Date(`${today()}T00:00:00.000Z`),
        category: 'Walk',
        description: 'Walk',
        duration: { value: 10, unit: 'minutes' },
      });
      pet.needs.push(need);
      await pet.save();

      const response = await api
        .delete(`/api/pets/${pet._id}/needs/${need._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.strictEqual(response.status, 204);

      const refreshed = await Pet.findById(pet._id);
      assert.strictEqual(refreshed.needs.length, 0);
    });
  });
});
