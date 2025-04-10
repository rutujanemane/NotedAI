const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session'
  }]
});

module.exports = mongoose.model('User', UserSchema);
