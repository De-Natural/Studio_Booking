const express = require('express');
const { createBooking, getAvailability, getTimeslots, getBookingById } = require('../controllers/booking.controller');
const { createBookingValidator } = require('../validators/booking.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Booking routes
router.post('/', createBookingValidator, validate, createBooking);
router.get('/:id', getBookingById);

// Availability routes (can be mounted at /api/availability or /api/bookings/availability)
router.get('/status', getAvailability); // For separate mount

// Timeslots route (can be mounted at /api/timeslots)
router.get('/slots', getTimeslots);

module.exports = router;
