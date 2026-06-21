const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const {
  api,
  registerAndLogin,
  createPet,
  createPetWithNeed,
} = require('./helpers');

dayjs.extend(utc);
dayjs.extend(timezone);

// The user's local "today" — adding a record requires the need's dateFor to
// match the user's current local date (see checkLocalDateByTimezone).
const localToday = (tz = 'Europe/Helsinki') =>
  dayjs().tz(tz).format('YYYY-MM-DD');

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
});

const today = () => new Date().toISOString().slice(0, 10);

describe('POST /api/pets/:id/newneed', () => {
  it('adds a need to a pet and returns 201 with the need', async () => {
    const { token } = await registerAndLogin();
    const pet = await createPet(token);

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        need: {
          category: 'Feeding',
          description: 'Morning meal',
          dateFor: today(),
          quantity: { value: 100, unit: 'g' },
        },
      });

    assert.strictEqual(response.status, 201);
    const added = response.body.needs[response.body.needs.length - 1];
    assert.strictEqual(added.category, 'Feeding');
    assert.strictEqual(added.quantity.value, 100);
  });

  it('returns 400 on an invalid need (category too short)', async () => {
    const { token } = await registerAndLogin();
    const pet = await createPet(token);

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        need: {
          category: 'ab',
          description: 'Too short category',
          dateFor: today(),
          duration: { value: 10, unit: 'minutes' },
        },
      });

    assert.strictEqual(response.status, 400);
    assert.ok(
      response.body.errorDetails.category,
      'should report category error',
    );
  });

  it('returns 401 when a non-owner tries to add a need', async () => {
    const owner = await registerAndLogin();
    const pet = await createPet(owner.token);

    const other = await registerAndLogin({
      userName: 'otherUser',
      email: 'other@example.com',
    });

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({
        need: {
          category: 'Walk',
          description: 'Evening walk',
          dateFor: today(),
          duration: { value: 30, unit: 'minutes' },
        },
      });

    assert.strictEqual(response.status, 401);
  });
});

describe('PUT /api/pets/:id/needs/:needid', () => {
  it('updates an existing need', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token);

    const response = await api
      .put(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Updated walk',
        description: 'A longer walk',
        duration: { value: 60, unit: 'minutes' },
      });

    assert.strictEqual(response.status, 200);
    const updated = response.body.needs.find((need) => need.id === needId);
    assert.strictEqual(updated.category, 'Updated walk');
    assert.strictEqual(updated.duration.value, 60);
  });

  it('returns 404 for an unknown need id', async () => {
    const { token } = await registerAndLogin();
    const { petId } = await createPetWithNeed(token);
    const unknownNeedId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .put(`/api/pets/${petId}/needs/${unknownNeedId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Ghost' });

    assert.strictEqual(response.status, 404);
  });

  it('returns 401 when a non-owner tries to update a need', async () => {
    const owner = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(owner.token);

    const other = await registerAndLogin({
      userName: 'otherUser',
      email: 'other@example.com',
    });

    const response = await api
      .put(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ category: 'Hacked' });

    assert.strictEqual(response.status, 401);
  });
});

describe('DELETE /api/pets/:id/needs/:needid', () => {
  it('deletes a need and returns 204', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token);

    const response = await api
      .delete(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 204);

    const pet = await Pet.findById(petId);
    assert.strictEqual(pet.needs.id(needId), null);
  });

  it('returns 404 for an unknown need id', async () => {
    const { token } = await registerAndLogin();
    const { petId } = await createPetWithNeed(token);
    const unknownNeedId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .delete(`/api/pets/${petId}/needs/${unknownNeedId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 404);
  });
});

describe('POST /api/pets/:id/needs/:needid/newrecord', () => {
  it('adds a record and completes the need when the duration is met', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token, {
      dateFor: localToday(),
      duration: { value: 40, unit: 'minutes' },
    });

    const response = await api
      .post(`/api/pets/${petId}/needs/${needId}/newrecord`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        note: 'Walked the full 40 min',
        duration: { value: 40, unit: 'minutes' },
      });

    assert.strictEqual(response.status, 201);
    const need = response.body.needs.find((n) => n.id === needId);
    assert.strictEqual(need.careRecords.length, 1);
    assert.strictEqual(need.completed, true);
  });

  it('does not complete the need when the duration is only partially met', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token, {
      dateFor: localToday(),
      duration: { value: 40, unit: 'minutes' },
    });

    const response = await api
      .post(`/api/pets/${petId}/needs/${needId}/newrecord`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Short walk', duration: { value: 10, unit: 'minutes' } });

    assert.strictEqual(response.status, 201);
    const need = response.body.needs.find((n) => n.id === needId);
    assert.strictEqual(need.completed, false);
  });

  it('returns 404 for an unknown need id', async () => {
    const { token } = await registerAndLogin();
    const { petId } = await createPetWithNeed(token, { dateFor: localToday() });
    const unknownNeedId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .post(`/api/pets/${petId}/needs/${unknownNeedId}/newrecord`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Ghost record', duration: { value: 10, unit: 'minutes' } });

    assert.strictEqual(response.status, 404);
  });
});
