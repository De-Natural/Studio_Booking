const Booking = require('../models/Booking');
const BlockedDate = require('../models/BlockedDate');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendError } = require('../utils/response');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalBookings, confirmedBookings, cancelledBookings, upcomingBookings, blockedDatesCount] =
    await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ date: { $gte: today }, status: 'confirmed' }),
      BlockedDate.countDocuments({ date: { $gte: today } }),
    ]);

  return sendResponse(res, 200, 'Stats fetched', {
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    upcomingBookings,
    blockedDatesCount,
  });
});

// @desc    Get all bookings (with optional filters)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, search, page = '1', limit = '10' } = req.query;
  const query = {};

  if (status && status !== 'all') {
    query.status = status.toLowerCase();
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
    Booking.countDocuments(query),
  ]);

  return sendResponse(res, 200, 'Bookings fetched', {
    bookings,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// @desc    Get recent bookings (for dashboard)
// @route   GET /api/admin/bookings/recent
// @access  Private (Admin)
const getRecentBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
  return sendResponse(res, 200, 'Recent bookings fetched', { bookings });
});

// @desc    Block a date
// @route   POST /api/admin/blocked-dates
// @access  Private (Admin)
const blockDate = asyncHandler(async (req, res) => {
  const { date, reason } = req.body;
  const dateObj = new Date(date);
  dateObj.setHours(12, 0, 0, 0);

  // Check if already blocked
  const existing = await BlockedDate.findOne({ date: dateObj });
  if (existing) {
    return sendError(res, 409, 'This date is already blocked');
  }

  const blockedDate = await BlockedDate.create({ date: dateObj, reason });

  return sendResponse(res, 201, 'Date blocked successfully', { blockedDate });
});

// @desc    Get all blocked dates
// @route   GET /api/admin/blocked-dates
// @access  Private (Admin)
const getBlockedDates = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const blockedDates = await BlockedDate.find({ date: { $gte: today } }).sort({ date: 1 });

  return sendResponse(res, 200, 'Blocked dates fetched', { blockedDates });
});

// @desc    Unblock a date
// @route   DELETE /api/admin/blocked-dates/:id
// @access  Private (Admin)
const unblockDate = asyncHandler(async (req, res) => {
  const blockedDate = await BlockedDate.findById(req.params.id);

  if (!blockedDate) {
    return sendError(res, 404, 'Blocked date not found');
  }

  await blockedDate.deleteOne();

  return sendResponse(res, 200, 'Date unblocked successfully');
});

// @desc    Update booking status
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
    return sendError(res, 400, 'Invalid status');
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, 404, 'Booking not found');
  }

  booking.status = status;
  await booking.save();

  return sendResponse(res, 200, `Booking marked as ${status}`, { booking });
});

// @desc    Delete a booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, 404, 'Booking not found');
  }

  await booking.deleteOne();

  return sendResponse(res, 200, 'Booking deleted successfully');
});

module.exports = {
  getStats,
  getAllBookings,
  getRecentBookings,
  blockDate,
  getBlockedDates,
  unblockDate,
  updateBookingStatus,
  deleteBooking,
};
