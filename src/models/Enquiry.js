const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model if you have one
    },
    firstName: {
        type: String,
        required: true,
      },
    lastName: {
    type: String,
    required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    postCode:{
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    propertiesCount: {
        type: Number,
        required: true,
    },
  });
  
  const Enquiry = mongoose.model('Enquiry', enquirySchema);
  
  module.exports = Enquiry;
  