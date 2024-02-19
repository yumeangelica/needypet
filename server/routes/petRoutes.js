const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getPetById, addNewPet, updatePet, deletePet, addNewNeed, addNewRecord } = require('../controllers/petController');

const petCareTakerValidationMiddleware = require('../middlewares/petCareTakerValidationMiddleware');
const petOwnerValidationMiddleware = require('../middlewares/petOwnerValidationMiddleware');
const getPetHandler = require('../middlewares/getPetHandler');

router.get('/pets/:id', getPetHandler, petCareTakerValidationMiddleware, getPetById);
router.post('/pets', petOwnerValidationMiddleware, addNewPet);
router.post('/pets/need/:id', getPetHandler, petOwnerValidationMiddleware, addNewNeed);
router.post('/pets/need/record/:id', getPetHandler, petCareTakerValidationMiddleware, addNewRecord);
router.put('/pets/:id', getPetHandler, petOwnerValidationMiddleware, updatePet);
router.delete('/pets/:id', getPetHandler, petOwnerValidationMiddleware, deletePet);

module.exports = router;
