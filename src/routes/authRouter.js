const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const auth = require('../middleware/auth');

// Debug route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);

// Debug log untuk melihat route yang terdaftar
console.log('Registered routes:', router.stack.map(r => r.route?.path).filter(Boolean));

module.exports = router;