const StudioSettings = require('../models/StudioSettings');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendError } = require('../utils/response');

const DEFAULT_SESSION_TYPES = [
  { id: 'AUDIO', label: 'Music Recording', icon: '🎵' },
  { id: 'PODCAST', label: 'Podcast', icon: '🎙️' },
  { id: 'PHOTOGRAPHY', label: 'Photography', icon: '📸' },
  { id: 'VIDEO', label: 'Video Shoot', icon: '🎬' },
  { id: 'OTHER', label: 'Other', icon: '✨' },
];

const DEFAULT_TIME_SLOTS = [
  { id: 'ts1', label: 'Morning (9:00 AM - 1:00 PM)', startTime: '09:00', endTime: '13:00' },
  { id: 'ts2', label: 'Afternoon (2:00 PM - 6:00 PM)', startTime: '14:00', endTime: '18:00' },
  { id: 'ts3', label: 'Evening (7:00 PM - 11:00 PM)', startTime: '19:00', endTime: '23:00' },
];

// @desc    Get studio settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await StudioSettings.findOne().lean();

  if (!settings) {
    const created = await StudioSettings.create({
      sessionTypes: DEFAULT_SESSION_TYPES,
      timeSlots: DEFAULT_TIME_SLOTS,
    });
    settings = created.toObject();
  }

  // Clean up Mongoose _id from subdocuments so our custom `id` fields are used
  if (settings.sessionTypes) {
    settings.sessionTypes = settings.sessionTypes.map(({ _id, ...rest }) => rest);
  }
  if (settings.timeSlots) {
    settings.timeSlots = settings.timeSlots.map(({ _id, ...rest }) => rest);
  }

  return sendResponse(res, 200, 'Settings fetched', { settings });
});

// @desc    Update studio settings
// @route   PATCH /api/admin/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  const { studioName, contactEmail, sessionTypes, timeSlots } = req.body;

  let settings = await StudioSettings.findOne();

  if (!settings) {
    settings = new StudioSettings();
  }

  if (studioName) settings.studioName = studioName;
  if (contactEmail) settings.contactEmail = contactEmail;
  if (sessionTypes) settings.sessionTypes = sessionTypes;
  if (timeSlots) settings.timeSlots = timeSlots;

  await settings.save();

  return sendResponse(res, 200, 'Settings updated successfully', { settings });
});

module.exports = {
  getSettings,
  updateSettings,
};
