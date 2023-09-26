const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  residence: {
    type: Object,
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  paymentIntent: {
    type: String,
    required: true,
  },
  reservationId: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
});

module.exports = mongoose.model('Trip', TripSchema);
