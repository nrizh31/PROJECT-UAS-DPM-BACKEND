const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Book = require('../models/book');
const bcrypt = require('bcrypt');

// Endpoint untuk verifikasi pembayaran dan membuat booking
router.post('/verify-payment', async (req, res) => {
    const { username, password, movieData, bookingDetails } = req.body;

    console.log('Verify payment request received:', {
        username,
        movieData,
        bookingDetails
    });

    if (!bookingDetails || !bookingDetails.totalAmount) {
        console.log('Total amount is missing in booking details');
        return res.status(400).json({
            success: false,
            message: 'Total amount is required'
        });
    }

    try {
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
            username: username,
            movieData: {
                id: movieData.id,
                title: movieData.title,
                poster_path: movieData.poster_path
            },
            bookingDetails: {
                date: bookingDetails.date,
                time: bookingDetails.time,
                selectedSeats: bookingDetails.selectedSeats || [],
                totalAmount: bookingDetails.totalAmount
            }
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

// Endpoint untuk mendapatkan booking pengguna
router.get('/user-bookings', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }

        console.log('Fetching bookings for username:', username);

        const bookings = await Book.find({ username })
            .sort({ createdAt: -1 });

        console.log(`Found ${bookings.length} bookings for user:`, username);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// Endpoint untuk membuat booking (dengan auth)
router.post('/create', auth, async (req, res) => {
    try {
        const { movieData, bookingDetails } = req.body;
        const username = req.user.username; // Ambil username dari user yang terautentikasi

        if (!movieData || !bookingDetails) {
            return res.status(400).json({
                success: false,
                message: 'Movie data and booking details are required'
            });
        }

        const booking = new Book({
            username,
            movieData,
            bookingDetails
        });

        await booking.save();
        console.log('New booking created:', booking._id);

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
});

// Endpoint untuk mendapatkan riwayat booking pengguna
router.get('/history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        console.log('Fetching booking history for:', username);
        
        const bookings = await Book.find({ username })
            .sort({ createdAt: -1 });

        console.log(`Found ${bookings.length} bookings in history`);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get booking history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking history',
            error: error.message
        });
    }
});

module.exports = router;