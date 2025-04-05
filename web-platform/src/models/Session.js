const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: function() {
      return `Session - ${new Date().toLocaleString()}`;
    }
  },
  transcript: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  tags: [String],
  duration: Number,
  isPrivate: {
    type: Boolean,
    default: false
  },
  stressMarked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
SessionSchema.index({ transcript: 'text', summary: 'text', tags: 'text' });

module.exports = mongoose.model('Session', SessionSchema);
