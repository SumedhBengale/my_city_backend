const mongoose = require('mongoose');

const residenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Condominimum', 'Bunglow', 'Flat', 'Apartment', 'House', 'Villa'],
    required: true,
  },
  beds: {
    type: Number,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  images: {
    type: [String],
  },
  amenities: {
    type: [String],
    required: true,
  },
  rules: {
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    partiesAllowed: {
      type: Boolean,
      default: false,
    },
    childrenAllowed: {
      type: Boolean,
      default: false,
    },
  },
  listingId: {
    type: String,
    required: true,
    unique: true,
  },
  coordinate: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
});

module.exports = mongoose.model('Residence', residenceSchema);
