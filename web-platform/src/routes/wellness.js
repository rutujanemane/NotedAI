const express = require('express');
const router = express.Router();
const { getWellnessTips } = require('../controllers/wellnessController');
const auth = require('../middleware/auth');

// Get wellness tips
router.get('/tips', auth, getWellnessTips);

module.exports = router;
