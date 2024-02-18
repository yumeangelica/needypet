const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getUserById, createNewUser, updateUser, deleteUser, loginUser } = require('../controllers/userController');
const passwordStrengthValidator = require('../middlewares/passwordStrengthValidator');

const authenticateToken = require('../middlewares/tokenValidatorMiddleware');
const getUserHandler = require('../middlewares/getUserHandler');

router.get('/users/:id', authenticateToken, getUserHandler, getUserById);
router.post('/users', passwordStrengthValidator, createNewUser);
router.post('/login', loginUser);
router.put('/users/:id', authenticateToken, getUserHandler, updateUser);
router.delete('/users/:id', authenticateToken, getUserHandler, deleteUser);

module.exports = router;
