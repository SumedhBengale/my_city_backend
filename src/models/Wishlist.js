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
      residence: {
        type: Object,
        required: true,
      }
    },
  ],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);