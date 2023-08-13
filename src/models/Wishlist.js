const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  wishlistItems: [
    {
      residenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Residence',
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);