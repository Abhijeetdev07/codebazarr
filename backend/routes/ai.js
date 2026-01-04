const express = require('express');
const router = express.Router();
const { generateDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

router.post('/generate-description', protect, isAdmin, generateDescription);

module.exports = router;
