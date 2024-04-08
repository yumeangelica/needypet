const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { addNewPet, updatePet, deletePet, addNewNeed, addNewRecord, deleteNeed, getAllUserPets } = require('../controllers/petController');

const petCareTakerValidationMiddleware = require('../middlewares/petCareTakerValidationMiddleware');
const petOwnerValidationMiddleware = require('../middlewares/petOwnerValidationMiddleware');
const getPetHandler = require('../middlewares/getPetHandler');

router.post('/pets', addNewPet);
router.get('/pets', getAllUserPets);
router.post('/pets/:id/newneed', getPetHandler, petOwnerValidationMiddleware, addNewNeed);
router.post('/pets/:id/needs/:needid/newrecord', getPetHandler, petCareTakerValidationMiddleware, addNewRecord);
router.put('/pets/:id', getPetHandler, petOwnerValidationMiddleware, updatePet);
router.delete('/pets/:id', getPetHandler, petOwnerValidationMiddleware, deletePet);
router.delete('/pets/:id/needs/:needid', getPetHandler, petOwnerValidationMiddleware, deleteNeed);

module.exports = router;
