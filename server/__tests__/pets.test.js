const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const { api, registerAndLogin, createPet } = require('./helpers');

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

describe('GET /api/pets', () => {
  it('returns the pets owned by the user', async () => {
    const { token } = await registerAndLogin();
    await createPet(token, { name: 'Milo' });
    await createPet(token, { name: 'Luna' });

    const response = await api
      .get('/api/pets')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 2);
    const names = response.body.map((pet) => pet.name).sort();
    assert.deepStrictEqual(names, ['Luna', 'Milo']);
  });

  it('returns an empty array when the user has no pets', async () => {
    const { token } = await registerAndLogin();

    const response = await api
      .get('/api/pets')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, []);
  });

  it("does not return another user's pets", async () => {
    const owner = await registerAndLogin();
    await createPet(owner.token, { name: 'Milo' });

    const other = await registerAndLogin({
      userName: 'otherUser',
      email: 'other@example.com',
    });

    const response = await api
      .get('/api/pets')
      .set('Authorization', `Bearer ${other.token}`);

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, []);
  });

  it('returns 401 without a token', async () => {
    const response = await api.get('/api/pets');
    assert.strictEqual(response.status, 401);
  });
});

describe('POST /api/pets', () => {
  it('creates a new pet and returns 201', async () => {
    const { token, id } = await registerAndLogin();

    const response = await api
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Milo', species: 'Cat', breed: 'Tabby' });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.name, 'Milo');
    assert.strictEqual(response.body.owner, id);
    assert.ok(response.body.id, 'created pet should have an id');
  });

  it('returns 401 without a token', async () => {
    const response = await api.post('/api/pets').send({ name: 'Milo' });
    assert.strictEqual(response.status, 401);
  });
});

describe('PUT /api/pets/:id', () => {
  it('updates a pet the user owns', async () => {
    const { token } = await registerAndLogin();
    const pet = await createPet(token, { name: 'Milo', species: 'Cat' });

    const response = await api
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Milo Updated', species: 'Dog' });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'Milo Updated');
    assert.strictEqual(response.body.species, 'Dog');
  });

  it('returns 401 when a non-owner tries to update', async () => {
    const owner = await registerAndLogin();
    const pet = await createPet(owner.token, { name: 'Milo' });

    const other = await registerAndLogin({
      userName: 'otherUser',
      email: 'other@example.com',
    });

    const response = await api
      .put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ name: 'Hacked' });

    assert.strictEqual(response.status, 401);
  });

  it('returns 404 for an unknown pet id', async () => {
    const { token } = await registerAndLogin();
    const unknownId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .put(`/api/pets/${unknownId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' });

    assert.strictEqual(response.status, 404);
  });
});

describe('DELETE /api/pets/:id', () => {
  it('deletes a pet the user owns and returns 204', async () => {
    const { token } = await registerAndLogin();
    const pet = await createPet(token, { name: 'Milo' });

    const response = await api
      .delete(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 204);

    const remaining = await Pet.findById(pet.id);
    assert.strictEqual(remaining, null);
  });

  it('returns 401 when a non-owner tries to delete', async () => {
    const owner = await registerAndLogin();
    const pet = await createPet(owner.token, { name: 'Milo' });

    const other = await registerAndLogin({
      userName: 'otherUser',
      email: 'other@example.com',
    });

    const response = await api
      .delete(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${other.token}`);

    assert.strictEqual(response.status, 401);

    // The pet should still exist.
    const stillThere = await Pet.findById(pet.id);
    assert.ok(stillThere, 'pet should not be deleted by a non-owner');
  });

  it('returns 404 for an unknown pet id', async () => {
    const { token } = await registerAndLogin();
    const unknownId = new mongoose.Types.ObjectId().toString();

    const response = await api
      .delete(`/api/pets/${unknownId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(response.status, 404);
  });
});
