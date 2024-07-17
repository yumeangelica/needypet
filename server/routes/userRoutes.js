const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const { getUserById, createNewUser, updateUser, deleteUser, loginUser, validateUserToken, verifyEmailConfirmationToken, resendEmailConfirmation, verifyPasswordResetToken, requestPasswordReset, passwordReset } = require('../controllers/userController');
const passwordStrengthValidator = require('../middlewares/passwordStrengthValidator');

const authenticateToken = require('../middlewares/tokenValidatorMiddleware');
const getUserHandler = require('../middlewares/getUserHandler');

router.get('/users/:id', authenticateToken, getUserHandler, getUserById);
router.post('/users', passwordStrengthValidator, createNewUser);
router.post('/login', loginUser);
router.post('/validatetoken', validateUserToken);
router.put('/users/:id', authenticateToken, getUserHandler, updateUser);
router.delete('/users/:id', authenticateToken, getUserHandler, deleteUser);
router.post('/verify-email-confirmation-token', verifyEmailConfirmationToken);
router.post('/resend-email-confirmation', authenticateToken, getUserHandler, resendEmailConfirmation);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset-token', verifyPasswordResetToken);
router.post('/password-reset', passwordReset);

module.exports = router;
