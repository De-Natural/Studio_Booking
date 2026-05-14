const crypto = require('crypto');
const Booking = require('../models/Booking');
const StudioSettings = require('../models/StudioSettings');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendError } = require('../utils/response');
const { sendUserConfirmation, sendAdminNotification } = require('../utils/mailer');
const { initializeTransaction, verifyTransaction, createRefund } = require('../config/paystack');
const env = require('../config/env');
const logger = require('../utils/logger');

// Helper to get time slots from DB or defaults
async function getTimeSlots() {
  const settings = await StudioSettings.findOne();
  if (settings && settings.timeSlots && settings.timeSlots.length > 0) {
    return settings.timeSlots;
  }
  return [
    { id: 'ts1', label: 'Morning (9:00 AM - 1:00 PM)', startTime: '09:00', endTime: '13:00' },
    { id: 'ts2', label: 'Afternoon (2:00 PM - 6:00 PM)', startTime: '14:00', endTime: '18:00' },
    { id: 'ts3', label: 'Evening (7:00 PM - 11:00 PM)', startTime: '19:00', endTime: '23:00' },
  ];
}

// @desc    Initialize a Paystack payment & create a pending booking
// @route   POST /api/payments/initialize
// @access  Public
const initializePayment = asyncHandler(async (req, res) => {
  const {
    name, clientName,
    email, clientEmail,
    phone, clientPhone,
    date, bookingDate: inputBookingDate,
    timeSlot,
    timeSlotId,
    sessionType,
    notes,
  } = req.body;

  const finalName = name || clientName;
  const finalEmail = email || clientEmail;
  const finalPhone = phone || clientPhone;
  const finalDate = date || inputBookingDate;

  if (!finalName || !finalEmail || !finalPhone || !finalDate) {
    return sendError(res, 400, 'Missing required fields');
  }

  // Resolve slot label/id
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
  const BlockedDate = require('../models/BlockedDate');
  const blocked = await BlockedDate.findOne({ date: bookingDate });
  if (blocked) {
    return sendError(res, 400, 'This date is blocked for bookings');
  }

  // 3. Check for double booking
  const existing = await Booking.findOne({
    date: bookingDate,
    $or: [{ timeSlot: slotLabel }, { timeSlotId: slotId }],
    status: { $in: ['confirmed', 'pending'] },
  });

  if (existing) {
    return sendError(res, 409, 'This time slot is already booked');
  }

  // 4. Determine price from session type
  let amountInKobo = 0;
  const settings = await StudioSettings.findOne();
  if (settings && settings.sessionTypes && sessionType) {
    const matchedType = settings.sessionTypes.find(s => s.label === sessionType);
    if (matchedType && matchedType.price) {
      amountInKobo = matchedType.price * 100; // Convert Naira to Kobo
    }
  }

  if (amountInKobo <= 0) {
    return sendError(res, 400, 'No price configured for this session type. Please contact admin.');
  }

  // 5. Generate unique reference
  const reference = `LUXE_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // 6. Create pending booking
  const booking = await Booking.create({
    name: finalName,
    email: finalEmail,
    phone: finalPhone,
    date: bookingDate,
    timeSlot: slotLabel,
    timeSlotId: slotId,
    sessionType,
    notes,
    status: 'pending',
    paymentReference: reference,
    paymentStatus: 'pending',
  });

  // 7. Initialize Paystack transaction
  const callbackUrl = `${env.FRONTEND_URL}/book/confirmation?id=${booking._id}&reference=${reference}`;

  const paystackRes = await initializeTransaction({
    email: finalEmail,
    amount: amountInKobo,
    reference,
    callback_url: callbackUrl,
    metadata: {
      bookingId: booking._id.toString(),
      clientName: finalName,
      sessionType,
      timeSlot: slotLabel,
    },
  });

  if (!paystackRes.status) {
    // Rollback booking if Paystack fails
    await Booking.findByIdAndDelete(booking._id);
    return sendError(res, 502, 'Payment initialization failed. Please try again.');
  }

  logger.info(`Payment initialized for booking ${booking._id}, ref: ${reference}`);

  return sendResponse(res, 200, 'Payment initialized', {
    authorizationUrl: paystackRes.data.authorization_url,
    accessCode: paystackRes.data.access_code,
    reference,
    bookingId: booking._id,
    amount: amountInKobo,
    publicKey: env.PAYSTACK_PUBLIC_KEY,
  });
});

// @desc    Verify a payment after Paystack redirect/callback
// @route   GET /api/payments/verify/:reference
// @access  Public
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return sendError(res, 400, 'Payment reference is required');
  }

  // Find the booking
  const booking = await Booking.findOne({ paymentReference: reference });
  if (!booking) {
    return sendError(res, 404, 'Booking not found for this payment reference');
  }

  // Already confirmed? Return early
  if (booking.paymentStatus === 'paid' && booking.status === 'confirmed') {
    return sendResponse(res, 200, 'Payment already verified', { booking });
  }

  // Verify with Paystack
  const paystackRes = await verifyTransaction(reference);

  if (!paystackRes.status || paystackRes.data.status !== 'success') {
    booking.paymentStatus = 'failed';
    await booking.save();
    return sendError(res, 400, 'Payment verification failed');
  }

  // Update booking
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.amountPaid = paystackRes.data.amount; // already in kobo
  booking.paidAt = new Date();
  await booking.save();

  logger.info(`Payment verified for booking ${booking._id}, ref: ${reference}`);

  // Send confirmation emails now that payment is confirmed
  sendUserConfirmation(booking).catch(err => logger.error('Email Error:', err));
  sendAdminNotification(booking).catch(err => logger.error('Email Error:', err));

  return sendResponse(res, 200, 'Payment verified successfully', {
    booking: {
      id: booking._id,
      name: booking.name,
      email: booking.email,
      date: booking.date,
      timeSlot: booking.timeSlot,
      sessionType: booking.sessionType,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amountPaid: booking.amountPaid,
    },
  });
});

// @desc    Paystack webhook handler
// @route   POST /api/payments/webhook
// @access  Webhook (signature verified)
const handleWebhook = asyncHandler(async (req, res) => {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    logger.warn('Invalid Paystack webhook signature');
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  // Handle charge.success event
  if (event.event === 'charge.success') {
    const { reference } = event.data;
    const booking = await Booking.findOne({ paymentReference: reference });

    if (booking && booking.paymentStatus !== 'paid') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.amountPaid = event.data.amount;
      booking.paidAt = new Date();
      await booking.save();

      logger.info(`Webhook: Payment confirmed for booking ${booking._id}, ref: ${reference}`);

      // Send confirmation emails
      sendUserConfirmation(booking).catch(err => logger.error('Webhook Email Error:', err));
      sendAdminNotification(booking).catch(err => logger.error('Webhook Email Error:', err));
    }
  }

  // Always respond 200 to Paystack
  return res.status(200).send('OK');
});

// @desc    Refund a payment (used when user cancels a booking)
// @route   Called internally, not an API route
const refundPayment = async (booking) => {
  if (!booking.paymentReference || booking.paymentStatus !== 'paid') {
    return { success: false, message: 'No payment to refund' };
  }

  try {
    const refundRes = await createRefund({
      transaction: booking.paymentReference,
    });

    if (refundRes.status) {
      logger.info(`Refund processed for booking ${booking._id}, ref: ${booking.paymentReference}`);
      return { success: true, data: refundRes.data };
    } else {
      logger.error(`Refund failed for booking ${booking._id}: ${refundRes.message}`);
      return { success: false, message: refundRes.message };
    }
  } catch (error) {
    logger.error(`Refund error for booking ${booking._id}: ${error.message}`);
    return { success: false, message: error.message };
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  refundPayment,
};
