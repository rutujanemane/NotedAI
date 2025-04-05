const express = require('express');
const router = express.Router();
const { transcribeAudio } = require('../controllers/transcribeController');
const auth = require('../middleware/auth');

// Transcribe audio file
router.post('/audio', auth, transcribeAudio);

module.exports = router;
