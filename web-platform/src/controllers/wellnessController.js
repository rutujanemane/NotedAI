const User = require('../models/User');
const Session = require('../models/Session');
const axios = require('axios');

// Get wellness tips based on user session data
const getWellnessTips = async (req, res) => {
  try {
    // Gather session statistics
    const sessionsCount = await Session.countDocuments({ user: req.user.id });
    const stressedSessions = await Session.countDocuments({ 
      user: req.user.id,
      stressMarked: true
    });
    
    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await Session.countDocuments({
      user: req.user.id,
      createdAt: { $gte: today }
    });
    
    // Get average session duration
    const sessions = await Session.find({ user: req.user.id });
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageDuration = sessions.length ? totalDuration / sessions.length : 0;
    
    // Generate wellness tip based on data
    let tip = '';
    
    if (todaySessions > 3) {
      tip = "You've had several sessions today. Consider taking a break to rest your mind.";
    } else if (stressedSessions / sessionsCount > 0.3) {
      tip = "Many of your sessions have been marked as stressful. Try incorporating short meditation breaks between conversations.";
    } else if (averageDuration > 60) {
      tip = "Your meetings tend to be quite long. Consider scheduling shorter meetings with clear agendas.";
    } else {
      tip = "You're doing great with your note-taking! Remember to take short breaks between sessions.";
    }
    
    // In a real implementation, we would use the OM1 API
    // for more sophisticated behavioral health insights
    
    res.json({ tip });
  } catch (error) {
    console.error('Wellness tips error:', error);
    res.status(500).json({ message: 'Error generating wellness tips' });
  }
};

module.exports = {
  getWellnessTips
};
