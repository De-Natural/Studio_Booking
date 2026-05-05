const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Admin route to update settings
router.patch('/admin', protect, updateSettings);

module.exports = router;
