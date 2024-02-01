const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getAllUsers, getUserById, createNewUser, updateUser, deleteUser, loginUser } = require('../controllers/userController');
const passwordStrengthValidator = require('../middlewares/passwordStrengthValidator');

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', passwordStrengthValidator, createNewUser); // Password strength validator middleware checks password strength before creating new user
router.post('/login', loginUser);
router.put('/users/:id', passwordStrengthValidator, updateUser); // Password strength validator middleware checks password strength before updating user
router.delete('/users/:id', deleteUser);

module.exports = router;
