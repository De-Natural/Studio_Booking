const express = require('express');
const { initializePayment, verifyPayment, handleWebhook } = require('../controllers/payment.controller');

const router = express.Router();

// Initialize payment (creates pending booking + Paystack transaction)
router.post('/initialize', initializePayment);

// Verify payment after redirect/callback
router.get('/verify/:reference', verifyPayment);

// Paystack webhook (signature-verified, no JWT)
router.post('/webhook', handleWebhook);

module.exports = router;
