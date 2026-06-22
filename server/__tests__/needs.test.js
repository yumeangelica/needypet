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

  it('returns 400 when quantity value is zero', async () => {
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
          quantity: { value: 0, unit: 'g' },
        },
      });

    assert.strictEqual(response.status, 400);
  });

  it('returns 400 when duration value is negative', async () => {
    const { token } = await registerAndLogin();
    const pet = await createPet(token);

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        need: {
          category: 'Walk',
          description: 'Morning walk',
          dateFor: today(),
          duration: { value: -1, unit: 'minutes' },
        },
      });

    assert.strictEqual(response.status, 400);
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

  it('returns 401 when an assigned caretaker tries to add a need', async () => {
    const owner = await registerAndLogin();
    const carer = await registerAndLogin({
      userName: 'carerUser',
      email: 'carer@example.com',
    });
    const pet = await createPet(owner.token);

    await api
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ careTakers: [carer.id] });

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${carer.token}`)
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

  it("stores a full datetime as the owner's local calendar day", async () => {
    const owner = await registerAndLogin({ timezone: 'Asia/Tokyo' });
    const pet = await createPet(owner.token);

    const response = await api
      .post(`/api/pets/${pet.id}/newneed`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        need: {
          category: 'Feeding',
          description: 'Late meal',
          dateFor: '2026-06-21T16:30:00.000Z',
          quantity: { value: 100, unit: 'g' },
        },
      });

    assert.strictEqual(response.status, 201);
    const added = response.body.needs[response.body.needs.length - 1];
    assert.strictEqual(added.dateFor, '2026-06-22');
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

  it('preserves the existing measure when only category/description change', async () => {
    const { token } = await registerAndLogin();
    // createPetWithNeed defaults to a duration need (40 minutes).
    const { petId, needId } = await createPetWithNeed(token);

    const response = await api
      .put(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Renamed walk' });

    assert.strictEqual(response.status, 200);
    const updated = response.body.needs.find((need) => need.id === needId);
    assert.strictEqual(updated.category, 'Renamed walk');
    // The duration must survive an update that omits any measure.
    assert.strictEqual(updated.duration.value, 40);
  });

  it('returns 400 when updating a need to zero quantity', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token);

    const response = await api
      .put(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Updated meal',
        description: 'Too little food',
        quantity: { value: 0, unit: 'g' },
      });

    assert.strictEqual(response.status, 400);
  });

  it('returns 400 when updating a need to negative duration', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token);

    const response = await api
      .put(`/api/pets/${petId}/needs/${needId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Updated walk',
        description: 'Impossible walk',
        duration: { value: -1, unit: 'minutes' },
      });

    assert.strictEqual(response.status, 400);
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

  it('returns 400 when adding a zero quantity record', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token, {
      dateFor: localToday(),
      duration: undefined,
      quantity: { value: 40, unit: 'g' },
    });

    const response = await api
      .post(`/api/pets/${petId}/needs/${needId}/newrecord`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'No food', quantity: { value: 0, unit: 'g' } });

    assert.strictEqual(response.status, 400);
  });

  it('returns 400 when adding a negative duration record', async () => {
    const { token } = await registerAndLogin();
    const { petId, needId } = await createPetWithNeed(token, {
      dateFor: localToday(),
      duration: { value: 40, unit: 'minutes' },
    });

    const response = await api
      .post(`/api/pets/${petId}/needs/${needId}/newrecord`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        note: 'Impossible walk',
        duration: { value: -1, unit: 'minutes' },
      });

    assert.strictEqual(response.status, 400);
  });

  it("uses the owner's timezone so a carer in another timezone can record", async () => {
    const ownerTz = 'Asia/Tokyo';
    const carerTz = 'America/New_York';

    const owner = await registerAndLogin({ timezone: ownerTz });
    const carer = await registerAndLogin({
      userName: 'carerUser',
      email: 'carer@example.com',
      timezone: carerTz,
    });

    // Need is for the owner's local "today".
    const { petId, needId } = await createPetWithNeed(owner.token, {
      dateFor: localToday(ownerTz),
      duration: { value: 30, unit: 'minutes' },
    });

    // Add the carer to the pet.
    await api
      .put(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ careTakers: [carer.id] });

    // The carer (different timezone) records against the owner's-today need.
    // The date check is judged by the owner's timezone, so this is allowed.
    const response = await api
      .post(`/api/pets/${petId}/needs/${needId}/newrecord`)
      .set('Authorization', `Bearer ${carer.token}`)
      .send({ note: 'Carer walk', duration: { value: 30, unit: 'minutes' } });

    assert.strictEqual(response.status, 201);
    const need = response.body.needs.find((n) => n.id === needId);
    assert.strictEqual(need.careRecords.length, 1);
    // The record is still stamped in the carer's own timezone.
    assert.strictEqual(need.careRecords[0].timezone, carerTz);
  });
});
