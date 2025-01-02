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
router.post('/admin/create-director', authorized(['SUPER_ADMIN', 'ADMIN']), UserController.createDirector);
router.get('/admin/get-all-directors', authorized(['SUPER_ADMIN', 'ADMIN']), UserController.getAllDirectors);
router.put('/admin/update-user/:id', authorized(['SUPER_ADMIN']), UserController.updateUser);
router.put('/admin/update-user-role/:id', authorized(['SUPER_ADMIN']), UserController.updateUserRole);
router.delete('/admin/delete-user/:id', authorized(['SUPER_ADMIN']), UserController.deleteUser);

module.exports = router;
