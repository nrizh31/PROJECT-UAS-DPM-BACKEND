const express = require('express');
const router = express.Router();
const bookController = require('../Controllers/bookController');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Book = require('../models/book');
const bcrypt = require('bcryptjs');

// Verifikasi password - hapus auth middleware untuk endpoint ini
router.post('/verify-password', bookController.verifyPassword);

// Buat booking baru
router.post('/create', auth, bookController.createBooking);

// Ambil history booking user
router.get('/user-bookings', auth, bookController.getUserBookings);

// Tambahkan endpoint baru untuk mendapatkan booking berdasarkan username
router.get('/history/:username', bookController.getUserBookings);

// Endpoint verifikasi password dan pembuatan booking
router.post('/verify-payment', async (req, res) => {
    try {
        const { username, password, movieData, bookingDetails } = req.body;
        
        console.log('Verify payment request received:', {
            username,
            movieData: movieData?.title,
            bookingDetails: {
                date: bookingDetails?.date,
                time: bookingDetails?.time,
                seats: bookingDetails?.seats
            }
        });

        // Cari user berdasarkan username
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Buat booking baru
        const booking = new Book({
            userId: user._id,
            movieId: movieData.id,
            movieTitle: movieData.title,
            date: bookingDetails.date,
            time: bookingDetails.time,
            seats: bookingDetails.seats,
            totalPrice: bookingDetails.totalPrice,
            status: 'completed'
        });

        await booking.save();
        console.log('Booking created successfully:', booking._id);

        res.status(200).json({
            success: true,
            message: 'Payment verified and booking created successfully',
            booking: booking
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router; 