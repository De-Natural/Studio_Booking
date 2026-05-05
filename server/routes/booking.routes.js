const express = require('express');
const { createBooking, getAvailability, getTimeslots, getBookingById, getUserBookings, cancelBooking } = require('../controllers/booking.controller');
const { createBookingValidator } = require('../validators/booking.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Booking routes
router.post('/', createBookingValidator, validate, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.patch('/:id/cancel', protect, cancelBooking);
router.get('/:id', getBookingById);

// Availability routes (can be mounted at /api/availability or /api/bookings/availability)
router.get('/status', getAvailability); // For separate mount

// Timeslots route (can be mounted at /api/timeslots)
router.get('/slots', getTimeslots);

module.exports = router;
