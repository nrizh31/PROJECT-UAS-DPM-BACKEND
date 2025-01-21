const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    tanggal: {
        type: Date,
        required: true
    },
    waktu: {
        type: String,
        required: true
    },
    seats: [{
        type: String,
        required: true
    }],
    totalHarga: {
        type: Number,
        required: true
    },
    statusPembayaran: {
        type: String,
        enum: ['pending', 'sukses', 'gagal'],
        default: 'pending'
    },
    metodePembayaran: String
}, { collection: 'booking' }); // Menentukan nama koleksi spesifik

module.exports = mongoose.model('Booking', bookingSchema);