const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, markPaymentFailed } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create Razorpay order (requires auth)
router.post('/create-order', protect, createOrder);

// Verify payment (requires auth)
router.post('/verify', protect, verifyPayment);

// Mark payment as failed (requires auth)
router.post('/failed', protect, markPaymentFailed);

module.exports = router;
