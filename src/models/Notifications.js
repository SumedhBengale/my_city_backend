const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notifications: [
    {
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      viewed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model('Notifications', notificationSchema);
