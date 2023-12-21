const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getAllPets, getPetById, addNewPet, updatePet, deletePet, addNewNeed, addNewRecord } = require('../controllers/petController'); // Controller functions

router.get('/pets', getAllPets);
router.get('/pets/:id', getPetById);
router.post('/pets', addNewPet);
router.post('/pets/need/:id', addNewNeed); // Route for adding new need
router.post('/pets/need/record/:id', addNewRecord); // Route for adding new record
router.put('/pets/:id', updatePet);
router.delete('/pets/:id', deletePet);

module.exports = router;
