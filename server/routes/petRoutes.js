const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getPetById, addNewPet, updatePet, deletePet, addNewNeed, addNewRecord, deleteNeed, getAllUserPets } = require('../controllers/petController');

const petCareTakerValidationMiddleware = require('../middlewares/petCareTakerValidationMiddleware');
const petOwnerValidationMiddleware = require('../middlewares/petOwnerValidationMiddleware');
const getPetHandler = require('../middlewares/getPetHandler');

router.get('/pets/:id', getPetHandler, petCareTakerValidationMiddleware, getPetById);
router.post('/pets', addNewPet);
router.get('/pets', getAllUserPets);
router.post('/pets/needs/:id', getPetHandler, petOwnerValidationMiddleware, addNewNeed);
router.post('/pets/needs/records/:id', getPetHandler, petCareTakerValidationMiddleware, addNewRecord);
router.put('/pets/:id', getPetHandler, petOwnerValidationMiddleware, updatePet);
router.delete('/pets/:id', getPetHandler, petOwnerValidationMiddleware, deletePet);
router.delete('/pets/:id/needs/:needid', getPetHandler, petOwnerValidationMiddleware, deleteNeed);

module.exports = router;
