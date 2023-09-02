const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model if you have one
  },
  name: {
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
  message:{
    type: String,
    required: true
  },
  contactMethods: [
    {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'text'],
    },
  ],
});

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

module.exports = ContactRequest;
