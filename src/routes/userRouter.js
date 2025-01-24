const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Debug route
router.get('/test', (req, res) => {
    console.log('User router test hit');
    res.json({ message: 'User router is working' });
});

// User routes (membutuhkan authentication)
router.get('/profile/:userId', userController.getProfile);
router.get('/', userController.getAllUsers);

// Log registered routes
console.log('User routes registered:', router.stack
    .filter(r => r.route)
    .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
    }))
);

module.exports = router; 