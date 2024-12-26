const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.post('/sign-up', UserController.signUp);
router.post('/sign-in', UserController.signIn);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/verify-email/:verificationToken', UserController.verifyUser);
router.post('/resend-email-verification', UserController.resendVerificationEmail);

module.exports = router;
