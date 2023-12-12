const express = require('express')
const router = express.Router()
const { getAllPets, getPetById, addNewPet, deletePet } = require('../controllers/petController') // controller functions

router.get('/pets', getAllPets)
router.get('/pets/:id', getPetById)
router.post('/pets', addNewPet)
router.delete('/pets/:id', deletePet)

module.exports = router