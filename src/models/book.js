const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieData: {
        movieId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        poster_path: {
            type: String,
            required: true
        }
    },
    bookingDetails: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        seats: [{
            type: String,
            required: true
        }],
        totalPrice: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);