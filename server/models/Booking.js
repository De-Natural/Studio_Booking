const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    // We keep timeSlotId if the frontend sends it, but the plan says timeSlot (String)
    // To stay compatible with existing frontend which sends timeSlotId:
    timeSlotId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent double bookings
bookingSchema.index({ date: 1, timeSlot: 1 }, { unique: true });
// Also index for timeSlotId if used
bookingSchema.index({ date: 1, timeSlotId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
