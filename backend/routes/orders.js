const express = require('express');
const router = express.Router();
const { getMyOrders, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// User routes
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, isAdmin, getAllOrders);

module.exports = router;
