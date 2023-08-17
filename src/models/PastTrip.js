const mongoose = require('mongoose');

const pastTripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  residenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Residence',
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
  review: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  }
});

module.exports = mongoose.model('PastTrip', pastTripSchema);
