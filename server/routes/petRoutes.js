const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getPetById, addNewPet, updatePet, deletePet, addNewNeed, addNewRecord } = require('../controllers/petController'); // Controller functions

const petCareTakerValidationMiddleware = require('../middlewares/petCareTakerValidationMiddleware'); // Middleware for checking if user is pet care taker
const petOwnerValidationMiddleware = require('../middlewares/petOwnerValidationMiddleware'); // Middleware for checking if user is pet owner
const getPetHandler = require('../middlewares/getPetHandler');

router.get('/pets/:id', getPetHandler, petCareTakerValidationMiddleware, getPetById);
router.post('/pets', petOwnerValidationMiddleware, addNewPet);
router.post('/pets/need/:id', getPetHandler, petOwnerValidationMiddleware, addNewNeed); // Route for adding new need
router.post('/pets/need/record/:id', getPetHandler, petCareTakerValidationMiddleware, addNewRecord); // Route for adding new record
router.put('/pets/:id', getPetHandler, petOwnerValidationMiddleware, updatePet);
router.delete('/pets/:id', getPetHandler, petOwnerValidationMiddleware, deletePet);

module.exports = router;
