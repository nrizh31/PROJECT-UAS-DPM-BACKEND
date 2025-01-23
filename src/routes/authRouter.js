const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-password', authController.verifyPassword);

module.exports = router;