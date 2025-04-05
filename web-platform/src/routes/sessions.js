const express = require('express');
const router = express.Router();
const { 
  createSession, 
  getSessions, 
  getSessionById, 
  updateSession, 
  deleteSession,
  searchSessions,
  askQuestion
} = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new session
router.post('/', createSession);

// Get all sessions for a user
router.get('/', getSessions);

// Search sessions
router.get('/search', searchSessions);

// Get a single session by ID
router.get('/:id', getSessionById);

// Update a session
router.put('/:id', updateSession);

// Delete a session
router.delete('/:id', deleteSession);

// Ask a question about a session
router.post('/:id/ask', askQuestion);

module.exports = router;
