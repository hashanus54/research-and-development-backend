const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js')

router.post('/signup', UserController.signUp);
router.post('/sign-in', UserController.signIn);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/verify-email/:verificationToken', UserController.verifyUser);

module.exports = router;
