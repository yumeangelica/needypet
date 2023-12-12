const express = require('express')
const router = express.Router()

let pets = require('../db/db') // temporary mock data for pets


// get all pets
router.get('/api/pets', (req, res) => {
  res.json(pets);
});

// get one pet
router.get('/api/pets/:id', (req, res) => {
  const id = Number(req.params.id);
  const pet = pets.find(pet => pet.id === id);
  if (pet) {
    res.json(pet);
  } else {
    res.status(404).end();
  }
});

// post pet to list
router.post('/api/pets', (req, res) => {
  const pet = req.body;
  if (pet.petName === undefined) {
    return res.status(400).json({ error: 'content missing' });
  }
  pets = pets.concat(pet);
  res.json(pet);
});

// delete pet from list
router.delete('/api/pets/:id', (req, res) => {
  const id = Number(req.params.id);
  pets = pets.filter(pet => pet.id !== id);
  res.status(204).end();
});


module.exports = router