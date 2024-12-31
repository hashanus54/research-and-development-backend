const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js');


router.post('/sign-up', UserController.signUp);
router.post('/sign-in', UserController.signIn);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/verify-email', UserController.verifyEmailWithOtp);
router.post('/verify-mobile', UserController.verifyPhoneWithOtp);
router.post('/resend-otp', UserController.resendOTP);
router.post('/create-director', authorized(['SUPER_ADMIN', 'ADMIN']), UserController.createDirector);
router.put('/update-user/:id', authorized(['SUPER_ADMIN']), UserController.updateUser);
router.put('/update-user-role/:id', authorized(['SUPER_ADMIN']), UserController.updateUserRole);
router.delete('/delete-user/:id', authorized(['SUPER_ADMIN']), UserController.deleteUser);

module.exports = router;
