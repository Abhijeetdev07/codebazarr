const Review = require('../models/Review');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

exports.getReviewsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ projectId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalReviews = await Review.countDocuments({ projectId });
    const totalPages = Math.ceil(totalReviews / limit) || 1;

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: reviews
    });
  } catch (error) {
    console.error('Get project reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { projectId } = req.params;
    const { rating, comment } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const existing = await Review.findOne({ projectId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project'
      });
    }

    const review = await Review.create({
      projectId,
      userId: req.user._id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own review.'
      });
    }

    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to update'
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own review.'
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.rating) query.rating = parseInt(req.query.rating);

    if (req.query.search) {
      query.comment = { $regex: new RegExp(req.query.search, 'i') };
    }

    const sortKey = String(req.query.sort || 'recent');
    const sort =
      sortKey === 'oldest'
        ? { createdAt: 1 }
        : sortKey === 'rating_high'
          ? { rating: -1, createdAt: -1 }
          : sortKey === 'rating_low'
            ? { rating: 1, createdAt: -1 }
            : { createdAt: -1 };

    const statsMatch = {
      ...(query.projectId && {
        projectId: new mongoose.Types.ObjectId(String(query.projectId))
      }),
      ...(query.userId && {
        userId: new mongoose.Types.ObjectId(String(query.userId))
      }),
      ...(Number.isFinite(query.rating) && { rating: query.rating }),
      ...(query.comment && { comment: query.comment })
    };

    const statsAgg = await Review.aggregate([
      { $match: statsMatch },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
        }
      }
    ]);

    const statsRow = statsAgg?.[0] || {
      totalReviews: 0,
      averageRating: 0,
      r1: 0,
      r2: 0,
      r3: 0,
      r4: 0,
      r5: 0
    };

    const reviews = await Review.find(query)
      .populate('projectId', 'title')
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalReviews = statsRow.totalReviews;
    const totalPages = Math.ceil(totalReviews / limit) || 1;

    res.status(200).json({
      success: true,
      count: reviews.length,
      stats: {
        averageRating: statsRow.averageRating || 0,
        totalReviews: statsRow.totalReviews || 0,
        distribution: {
          5: statsRow.r5 || 0,
          4: statsRow.r4 || 0,
          3: statsRow.r3 || 0,
          2: statsRow.r2 || 0,
          1: statsRow.r1 || 0
        }
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: reviews
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error?.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
};

exports.deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};
