const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    movieData: {
        id: String,
        title: String,
        poster_path: String
    },
    bookingDetails: {
        date: String,
        time: String,
        selectedSeats: [String],
        totalAmount: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);