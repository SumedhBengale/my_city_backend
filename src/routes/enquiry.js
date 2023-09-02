const express = require('express');
const Enquiry = require('../models/Enquiry'); // Import your model
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/newEnquiry', requireAuth, async (req, res) => {
  try {
    const data = req.body;
        console.log(data)

    const { userId, firstName, lastName, email, phone, postCode, location, propertiesCount  } = data;
    console.log(req.body)

    // Create a new ContactRequest instance
    const newEnquiry = new Enquiry({
      userId,
      firstName,
      lastName,
      email,
      phone,
      postCode,
      location,
      propertiesCount,
    });

    // Save the contact request to the database
    await newEnquiry.save();
    console.log(newEnquiry)
    res.status(201).json({ message: 'Enquiry created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the enquiry' });
  }
});

router.post('/getEnquiries', requireAuth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        res.status(200).json({ enquiries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving contact requests' });
    }
});


module.exports = router;