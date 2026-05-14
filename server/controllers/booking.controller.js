const Booking = require('../models/Booking');
const BlockedDate = require('../models/BlockedDate');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendError } = require('../utils/response');
const { sendUserConfirmation, sendAdminNotification } = require('../utils/mailer');
const logger = require('../utils/logger');

const StudioSettings = require('../models/StudioSettings');

// Helper to get time slots from DB or defaults
async function getTimeSlots() {
  // Use .lean() to get plain JS objects — avoids Mongoose's `id` virtual
  // shadowing the stored `id` field (e.g., 'ts1') with _id.toString()
  const settings = await StudioSettings.findOne().lean();
  if (settings && settings.timeSlots && settings.timeSlots.length > 0) {
    // Strip Mongoose _id from subdocuments, keep our custom id
    return settings.timeSlots.map(({ _id, ...rest }) => rest);
  }
  return [
    { id: 'ts1', label: 'Morning (9:00 AM - 1:00 PM)', startTime: '09:00', endTime: '13:00' },
    { id: 'ts2', label: 'Afternoon (2:00 PM - 6:00 PM)', startTime: '14:00', endTime: '18:00' },
    { id: 'ts3', label: 'Evening (7:00 PM - 11:00 PM)', startTime: '19:00', endTime: '23:00' },
  ];
}

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
  const { 
    name, clientName,
    email, clientEmail,
    phone, clientPhone,
    date, bookingDate: inputBookingDate,
    timeSlot,
    timeSlotId,
    sessionType,
    notes 
  } = req.body;

  const finalName = name || clientName;
  const finalEmail = email || clientEmail;
  const finalPhone = phone || clientPhone;
  const finalDate = date || inputBookingDate;

  if (!finalName || !finalEmail || !finalPhone || !finalDate) {
    return sendError(res, 400, 'Missing required fields');
  }

  // Compatibility: If timeSlotId is provided but not label, find label
  let slotLabel = timeSlot;
  let slotId = timeSlotId;
  const dbSlots = await getTimeSlots();

  if (slotId && !slotLabel) {
    const slot = dbSlots.find(s => s.id === slotId);
    if (slot) slotLabel = slot.label;
  }
  if (!slotId && slotLabel) {
    const slot = dbSlots.find(s => s.label === slotLabel);
    if (slot) slotId = slot.id;
  }

  const bookingDate = new Date(finalDate);
  bookingDate.setHours(12, 0, 0, 0);

  // 1. Reject past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return sendError(res, 400, 'Cannot book a date in the past');
  }

  // 2. Check if date is blocked
  const blocked = await BlockedDate.findOne({ date: bookingDate });
  if (blocked) {
    return sendError(res, 400, 'This date is blocked for bookings');
  }

  // 3. Check for double booking
  const existing = await Booking.findOne({
    date: bookingDate,
    $or: [{ timeSlot: slotLabel }, { timeSlotId: slotId }]
  });

  if (existing && existing.status === 'confirmed') {
    return sendError(res, 409, 'This time slot is already booked');
  }

  // 4. Create booking (pending until payment is made)
  const booking = await Booking.create({
    name: finalName,
    email: finalEmail,
    phone: finalPhone,
    date: bookingDate,
    timeSlot: slotLabel,
    timeSlotId: slotId,
    sessionType: sessionType,
    notes,
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  // Note: Emails are sent AFTER payment is verified (see payment.controller.js)

  return sendResponse(res, 201, 'Booking created successfully. Please complete payment.', {
    booking: {
      id: booking._id,
      name: booking.name,
      email: booking.email,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    }
  });
});

// @desc    Get availability
// @route   GET /api/availability
// @access  Public
const getAvailability = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endLimit = new Date(today);
  endLimit.setMonth(endLimit.getMonth() + 3);

  const bookings = await Booking.find({
    date: { $gte: today, $lte: endLimit },
    status: 'confirmed'
  });

  const blockedDates = await BlockedDate.find({
    date: { $gte: today, $lte: endLimit }
  });

  const availability = {};
  const dbSlots = await getTimeSlots();
  const totalSlotsCount = dbSlots.length;

  // Count bookings per date
  const bookingsPerDate = {};
  bookings.forEach(b => {
    const key = b.date.toISOString().split('T')[0];
    bookingsPerDate[key] = (bookingsPerDate[key] || 0) + 1;
  });

  // Mark 'booked' if all slots taken
  Object.entries(bookingsPerDate).forEach(([date, count]) => {
    if (count >= totalSlotsCount) {
      availability[date] = 'booked';
    }
  });

  // Mark 'blocked'
  blockedDates.forEach(bd => {
    const key = bd.date.toISOString().split('T')[0];
    availability[key] = 'blocked';
  });

  return sendResponse(res, 200, 'Availability fetched', { availability });
});

// @desc    Get timeslots for a date (for frontend compatibility)
// @route   GET /api/timeslots
// @access  Public
const getTimeslots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) return sendError(res, 400, 'Date is required');

  const bookingDate = new Date(date);
  bookingDate.setHours(12, 0, 0, 0);

  const blocked = await BlockedDate.findOne({ date: bookingDate });
  if (blocked) return sendResponse(res, 200, 'Date is blocked', { slots: [], blocked: true });

  const bookings = await Booking.find({ date: bookingDate, status: 'confirmed' });
  const bookedSlotIds = new Set(bookings.map(b => b.timeSlotId || b.timeSlot));

  const dbSlots = await getTimeSlots();
  const slots = dbSlots.map(slot => ({
    id: slot.id,
    label: slot.label,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isBooked: bookedSlotIds.has(slot.id) || bookedSlotIds.has(slot.label)
  }));

  return sendResponse(res, 200, 'Timeslots fetched', { slots });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Public (for confirmation)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, 404, 'Booking not found');
  }

  return sendResponse(res, 200, 'Booking fetched', { booking });
});

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const email = req.user.email;
  
  const bookings = await Booking.find({ email }).sort({ date: -1 });

  return sendResponse(res, 200, 'User bookings fetched', { bookings });
});

// @desc    Cancel a booking (by user)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, 404, 'Booking not found');
  }

  // Ensure user can only cancel their own booking
  if (booking.email !== req.user.email) {
    return sendError(res, 403, 'Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    return sendError(res, 400, 'Booking is already cancelled');
  }

  // Auto-refund if payment was made
  let refundResult = null;
  if (booking.paymentStatus === 'paid' && booking.paymentReference) {
    const { refundPayment } = require('./payment.controller');
    refundResult = await refundPayment(booking);
    if (refundResult.success) {
      booking.paymentStatus = 'refunded';
      logger.info(`Refund processed for cancelled booking ${booking._id}`);
    } else {
      logger.error(`Refund failed for booking ${booking._id}: ${refundResult.message}`);
      // Still cancel the booking but note the refund failure
    }
  }

  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'No reason provided';
  await booking.save();

  return sendResponse(res, 200, 'Booking cancelled successfully', {
    booking,
    refund: refundResult ? { success: refundResult.success, message: refundResult.message } : null,
  });
});

module.exports = {
  createBooking,
  getAvailability,
  getTimeslots,
  getBookingById,
  getUserBookings,
  cancelBooking,
};
