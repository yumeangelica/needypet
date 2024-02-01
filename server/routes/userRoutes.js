const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getAllUsers, getUserById, createNewUser, updateUser, deleteUser, loginUser } = require('../controllers/userController');

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createNewUser);
router.post('/login', loginUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
