const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getAllBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { uploadBanner } = require('../middleware/upload');

// Public routes
router.get('/', getAllBanners);
// Admin route to get all banners (including inactive) - Must be before /:id
router.get('/all', protect, isAdmin, getAllBannersAdmin);
router.get('/:id', getBannerById);

// Admin routes (protected)
router.post('/', protect, isAdmin, uploadBanner, createBanner);
router.put('/:id', protect, isAdmin, uploadBanner, updateBanner);
router.delete('/:id', protect, isAdmin, deleteBanner);
router.patch('/:id/toggle', protect, isAdmin, toggleBannerStatus);

module.exports = router;
