const express = require('express');
const router = express.Router();
const bookController = require('../Controllers/bookController');
const auth = require('../middleware/auth');

// Verifikasi password
router.post('/verify-password', bookController.verifyPassword);

// Buat booking baru
router.post('/create', auth, bookController.createBooking);

// Ambil history booking user
router.get('/user-bookings', auth, bookController.getUserBookings);

module.exports = router; 