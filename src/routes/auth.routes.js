const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register
router.post('/register', authController.register);

// Login (Verify)
router.post('/login', authController.login);

// OTP
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);

module.exports = router;
