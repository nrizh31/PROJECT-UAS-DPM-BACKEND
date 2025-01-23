const Book = require('../models/book');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.verifyPassword = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password salah'
            });
        }

        res.json({
            success: true,
            message: 'Password verified'
        });
    } catch (error) {
        console.error('Verify password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { userId, movieData, bookingDetails } = req.body;

        const booking = new Book({
            userId,
            movieData,
            bookingDetails
        });

        await booking.save();

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat booking'
        });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Book.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data booking'
        });
    }
}; 