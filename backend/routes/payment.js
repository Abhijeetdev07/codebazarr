const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create Razorpay order (requires auth)
router.post('/create-order', protect, createOrder);

// Verify payment (requires auth)
router.post('/verify', protect, verifyPayment);

module.exports = router;
