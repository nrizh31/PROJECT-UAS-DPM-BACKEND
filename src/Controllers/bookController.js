const Book = require('../models/book');
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.verifyPassword = async (req, res) => {
    try {
        const { username, password, movieData, bookingDetails } = req.body;
        console.log('Debug - Full request body:', req.body);

        // Validate required fields
        if (!bookingDetails || !bookingDetails.totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Booking details and total amount are required'
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Create new booking with validated data
        const newBooking = new Book({
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

        console.log('Debug - New booking object:', newBooking);

        await newBooking.save();
        console.log('Booking saved successfully:', newBooking._id);

        res.json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Detailed booking error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
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
        const { username } = req.params;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const bookings = await Book.find({ userId: user._id })
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