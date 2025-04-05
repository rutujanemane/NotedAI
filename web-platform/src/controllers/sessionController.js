const Session = require('../models/Session');
const User = require('../models/User');
const { transcribeAudio, summarizeTranscript, askGemini } = require('../utils/aiServices');

// Create a new session
const createSession = async (req, res) => {
  try {
    const { transcript, title, isPrivate, stressMarked, duration } = req.body;
    
    // Generate summary using AI
    const summary = await summarizeTranscript(transcript);
    
    // Create new session
    const newSession = new Session({
      user: req.user.id,
      transcript,
      summary,
      title: title || undefined,
      isPrivate: isPrivate || false,
      stressMarked: stressMarked || false,
      duration: duration || 0
    });
    
    // Save session
    await newSession.save();
    
    // Add session to user's sessions
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { sessions: newSession._id } }
    );
    
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Error creating session' });
  }
};

// Get all sessions for a user
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Error retrieving sessions' });
  }
};

// Get a single session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to access this session' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Error retrieving session' });
  }
};

// Update a session
const updateSession = async (req, res) => {
  try {
    const { title, isPrivate, stressMarked, tags } = req.body;
    
    // Find the session
    const session = await Session.findById(req.params.id);
    
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this session' });
    }
    
    // Update fields
    if (title) session.title = title;
    if (isPrivate !== undefined) session.isPrivate = isPrivate;
    if (stressMarked !== undefined) session.stressMarked = stressMarked;
    if (tags) session.tags = tags;
    
    // Save updated session
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Error updating session' });
  }
};

// Delete a session
const deleteSession = async (req, res) => {
  try {
    // Find the session
    const session = await Session.findById(req.params.id);
    
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this session' });
    }
    
    // Delete session
    await session.deleteOne();;
    
    // Remove session from user's sessions
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { sessions: req.params.id } }
    );
    
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Error deleting session' });
  }
};

// Search sessions by query
const searchSessions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search using MongoDB text index
    const sessions = await Session.find({
      $and: [
        { user: req.user.id },
        { $text: { $search: query } }
      ]
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json(sessions);
  } catch (error) {
    console.error('Search sessions error:', error);
    res.status(500).json({ message: 'Error searching sessions' });
  }
};

// Ask questions about a session
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const { id } = req.params;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }
    
    // Find the session
    const session = await Session.findById(id);
    
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user owns the session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to access this session' });
    }
    
    // Use Gemini API to answer the question based on the transcript
    const response = await askGemini(session.transcript, question);
    
    res.json({ answer: response });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ message: 'Error processing question' });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  searchSessions,
  askQuestion
};
