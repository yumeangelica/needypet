const express = require('express')
const router = express.Router()
const {getAllUsers, createNewUser} = require('../controllers/userController')

router.get('/users', getAllUsers)
router.post('/users', createNewUser)

module.exports = router