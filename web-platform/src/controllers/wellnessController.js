const User = require('../models/User');
const Session = require('../models/Session');
const { askGemini } = require('../utils/aiServices');

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
    
    // Get recent sessions for time analysis
    const recentSessions = await Session.find({ 
      user: req.user.id 
    }).sort({ createdAt: -1 }).limit(10);
    
    // Calculate average session duration
    const totalDuration = recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageDuration = recentSessions.length ? totalDuration / recentSessions.length : 0;
    
    // Calculate the stress ratio
    const stressRatio = sessionsCount > 0 ? (stressedSessions / sessionsCount) : 0;
    
    // Prepare contextual data for Gemini
    const userContext = {
      totalSessions: sessionsCount,
      stressedSessions: stressedSessions,
      stressRatio: stressRatio,
      todaySessions: todaySessions,
      averageDuration: Math.round(averageDuration),
      recentSessionCount: recentSessions.length,
      timePattern: getTimePattern(recentSessions)
    };
    
    // Generate prompt for Gemini
    const prompt = `Based on the following user's session patterns, provide a personalized wellness tip related to better meeting habits, work-life balance, or productivity. Keep it positive, helpful, and under 300 characters.

User session data:
- Total sessions recorded: ${userContext.totalSessions}
- Percentage of sessions marked as stressful: ${(userContext.stressRatio * 100).toFixed(1)}%
- Number of sessions today: ${userContext.todaySessions}
- Average session duration: ${userContext.averageDuration} seconds
- Time pattern: ${userContext.timePattern}

Personalized wellness tip:`;

    // Call Gemini to generate wellness tip
    let tip = await askGemini(prompt, "Generate wellness tip");
    
    // Clean up the tip if needed
    tip = tip.trim();
    
    // Fallback tip in case of API failure
    if (!tip) {
      tip = "Remember to take short breaks between meetings to recharge and maintain focus throughout your day.";
    }
    
    res.json({ tip });
  } catch (error) {
    console.error('Wellness tips error:', error);
    res.status(500).json({ 
      message: 'Error generating wellness tips',
      tip: "Remember to take breaks between sessions to stay refreshed and focused."
    });
  }
};

// Helper function to analyze time patterns
function getTimePattern(sessions) {
  if (sessions.length < 3) return "Not enough data to determine pattern";
  
  // Check if sessions are clustered in morning, afternoon, or evening
  let morning = 0, afternoon = 0, evening = 0;
  
  sessions.forEach(session => {
    const hour = new Date(session.createdAt).getHours();
    
    if (hour >= 5 && hour < 12) morning++;
    else if (hour >= 12 && hour < 17) afternoon++;
    else evening++;
  });
  
  const total = sessions.length;
  const morningPct = (morning / total) * 100;
  const afternoonPct = (afternoon / total) * 100;
  const eveningPct = (evening / total) * 100;
  
  // Check for consecutive days pattern
  const consecutiveDays = getConsecutiveDays(sessions);
  
  // Determine primary time pattern
  let timePattern = "";
  if (morningPct > 50) timePattern = "Mostly morning sessions";
  else if (afternoonPct > 50) timePattern = "Mostly afternoon sessions";
  else if (eveningPct > 50) timePattern = "Mostly evening sessions";
  else timePattern = "Mixed time sessions";
  
  if (consecutiveDays >= 3) {
    timePattern += `, with activity on ${consecutiveDays} consecutive days`;
  }
  
  return timePattern;
}

// Helper function to check consecutive days pattern
function getConsecutiveDays(sessions) {
  if (sessions.length < 2) return 1;
  
  // Extract dates and sort them
  const dates = sessions.map(s => {
    const date = new Date(s.createdAt);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }).sort();
  
  // Remove duplicates (same day sessions)
  const uniqueDates = [...new Set(dates)];
  
  // Count max consecutive days
  let maxConsecutive = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = uniqueDates[i] - uniqueDates[i-1];
    
    // Check if dates are consecutive (86400000 ms = 1 day)
    if (diff === 86400000) {
      currentStreak++;
      maxConsecutive = Math.max(maxConsecutive, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxConsecutive;
}

module.exports = {
  getWellnessTips
};