const express = require('express');
const ContactRequest = require('../models/ContactRequest'); // Import your model
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/newRequest', requireAuth, async (req, res) => {
  try {
    const { data } = req.body;
    const { userId, name, email, phone, message, contactMethods } = data;
    console.log(req.body)


    // Create a new ContactRequest instance
    const newContactRequest = new ContactRequest({
      userId,
      name,
      email,
      phone,
      contactMethods,
      message
    });

    // Save the contact request to the database
    await newContactRequest.save();

    res.status(201).json({ message: 'Contact request created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the contact request' });
  }
});


module.exports = router;