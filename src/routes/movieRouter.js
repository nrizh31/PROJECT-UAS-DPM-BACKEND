const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const auth = require('../middleware/auth');

// Create new booking
router.post('/', auth, async (req, res) => {
  try {
    const booking = new Booking({
      userId: req.user.id,
      ...req.body
    });
    
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ message: 'Error creating booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Update booking payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { statusPembayaran: req.body.status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(400).json({ message: 'Error updating payment status' });
  }
});

module.exports = router;
