const mongoose = require('mongoose');

const studioSettingsSchema = new mongoose.Schema(
  {
    studioName: {
      type: String,
      default: 'LuxeLoft Studio',
    },
    contactEmail: {
      type: String,
      default: 'homeaway.479@gmail.com',
    },
    sessionTypes: [
      {
        id: String,
        label: String,
        icon: String,
      }
    ],
    timeSlots: [
      {
        id: String,
        label: String,
        startTime: String,
        endTime: String,
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudioSettings', studioSettingsSchema);
