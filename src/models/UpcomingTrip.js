const mongoose = require('mongoose');

const upcomingTripSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('UpcomingTrip', upcomingTripSchema);
