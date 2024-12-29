const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.post('/sign-up', UserController.signUp);
router.post('/sign-in', UserController.signIn);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/verify-otp', UserController.verifyUserWithOtp);
router.post('/resend-otp', UserController.resendOTP);

module.exports = router;
