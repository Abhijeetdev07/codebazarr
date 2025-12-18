const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { uploadMultiple } = require('../middleware/upload');

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Admin routes (protected)
router.post('/', protect, isAdmin, uploadMultiple, createProject);
router.put('/:id', protect, isAdmin, uploadMultiple, updateProject);
router.delete('/:id', protect, isAdmin, deleteProject);

module.exports = router;
