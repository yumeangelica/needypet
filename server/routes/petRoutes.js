const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { addNewPet, updatePet, deletePet, addNewNeed, addNewRecord, deleteNeed, getAllUserPets, toggleNeedisActive, updateNeed } = require('../controllers/petController');

const petCareTakerValidationMiddleware = require('../middlewares/petCareTakerValidationMiddleware');
const petOwnerValidationMiddleware = require('../middlewares/petOwnerValidationMiddleware');
const getPetHandler = require('../middlewares/getPetHandler');

router.post('/pets', addNewPet);
router.get('/pets', getAllUserPets);
router.post('/pets/:id/newneed', getPetHandler, petOwnerValidationMiddleware, addNewNeed);
router.post('/pets/:id/needs/:needid/newrecord', getPetHandler, petCareTakerValidationMiddleware, addNewRecord);
router.put('/pets/:id/needs/:needid', getPetHandler, petOwnerValidationMiddleware, updateNeed);
router.put('/pets/:id', getPetHandler, petOwnerValidationMiddleware, updatePet);
router.patch('/pets/:id/needs/:needid/togglestatus', getPetHandler, petOwnerValidationMiddleware, toggleNeedisActive);
router.delete('/pets/:id', getPetHandler, petOwnerValidationMiddleware, deletePet);
router.delete('/pets/:id/needs/:needid', getPetHandler, petOwnerValidationMiddleware, deleteNeed);

module.exports = router;
