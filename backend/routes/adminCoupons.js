const express = require('express');
const router = express.Router();

const {
  createCoupon,
  getAllCoupons,
  toggleCouponStatus,
  deleteCoupon
} = require('../controllers/couponController');

const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

router.post('/', protect, isAdmin, createCoupon);
router.get('/', protect, isAdmin, getAllCoupons);
router.patch('/:id/toggle', protect, isAdmin, toggleCouponStatus);
router.delete('/:id', protect, isAdmin, deleteCoupon);

module.exports = router;
