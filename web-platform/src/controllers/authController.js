const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  try {
    // Passport attaches the user to the request object
    const { _id, name, email, googleId, profilePicture } = req.user;
    
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Send response with token and user data
    res.json({
      token,
      user: { _id, name, email, googleId, profilePicture }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  googleCallback,
  getCurrentUser
};
