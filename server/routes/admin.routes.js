const express = require('express');
const {
  getStats,
  getAllBookings,
  getRecentBookings,
  blockDate,
  getBlockedDates,
  unblockDate,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/admin.controller');
const { blockDateValidator } = require('../validators/admin.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes are protected
router.use(protect);

// Dashboard stats
router.get('/stats', getStats);

// Bookings management
router.get('/bookings', getAllBookings);
router.get('/bookings/recent', getRecentBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

// Blocked dates management
router.get('/blocked-dates', getBlockedDates);
router.post('/blocked-dates', blockDateValidator, validate, blockDate);
router.delete('/blocked-dates/:id', unblockDate);

module.exports = router;
