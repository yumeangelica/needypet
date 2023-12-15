const express = require('express')
const router = express.Router()
const { getAllPets, getPetById, addNewPet, updatePet, deletePet, addNewNeed } = require('../controllers/petController') // controller functions

router.get('/pets', getAllPets)
router.get('/pets/:id', getPetById)
router.post('/pets', addNewPet)
router.post('/pets/need/:id', addNewNeed) // route for adding new need
router.put('/pets/:id', updatePet)
router.delete('/pets/:id', deletePet)

module.exports = router