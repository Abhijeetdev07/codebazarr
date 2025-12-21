const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getReviewsByProject,
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  deleteReviewAdmin
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const createReviewValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot be more than 1000 characters')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot be more than 1000 characters')
];

router.get('/project/:projectId', getReviewsByProject);
router.post('/project/:projectId', protect, createReviewValidation, createReview);

router.put('/:id', protect, updateReviewValidation, updateReview);
router.delete('/:id', protect, deleteReview);

router.get('/', protect, isAdmin, getAllReviewsAdmin);
router.delete('/:id/admin', protect, isAdmin, deleteReviewAdmin);

module.exports = router;
