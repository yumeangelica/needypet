const express = require('express')
const router = express.Router()
const {getAllUsers, createNewUser, loginUser} = require('../controllers/userController')

router.get('/users', getAllUsers)
router.post('/users', createNewUser)
router.post('/login', loginUser)

module.exports = router