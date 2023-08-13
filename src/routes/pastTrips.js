const express = require('express');
const PastTrip = require('../models/PastTrip');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/getPastTrips', requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Find all past trips of the user
      const pastTrips = await PastTrip.find({ userId });
  
      // Return the past trips
      res.status(200).json({ pastTrips });
    } catch (error) {
      console.error('Error in retrieving past trips:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// POST /api/add
router.post('/add', requireAuth, async (req, res) => {
  try {
    const {residenceId, checkInDate, checkOutDate } = req.body;
    const userId = req.user._id;

    // Create a new past trip
    const pastTrip = new PastTrip({
      userId,
      residenceId,
      checkInDate,
      checkOutDate,
    });

    // Save the past trip to the database
    await pastTrip.save();

    // Return the saved past trip
    res.status(201).json({ pastTrip });
  } catch (error) {
    console.error('Error in adding past trip:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/addReview', requireAuth, async (req, res) => {
    try {
      const { review, id } = req.body;
  
      // Find the past trip by ID
      const pastTrip = await PastTrip.findById(id);
  
      if (!pastTrip) {
        return res.status(404).json({ message: 'Past trip not found' });
      }
  
      // Add the review to the past trip
      pastTrip.review = review;
  
      // Save the updated past trip
      await pastTrip.save();
  
      // Return the updated past trip
      res.status(200).json({ pastTrip });
    } catch (error) {
      console.error('Error in adding review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // PUT /api/past-trips/:id/review
router.put('/updateReview', requireAuth, async (req, res) => {
    try {
      const { review, id } = req.body;
  
      // Find the past trip by ID
      const pastTrip = await PastTrip.findById(id);
  
      if (!pastTrip) {
        return res.status(404).json({ message: 'Past trip not found' });
      }
  
      // Update the review of the past trip
      pastTrip.review = review;
  
      // Save the updated past trip
      await pastTrip.save();
  
      // Return the updated past trip
      res.status(200).json({ pastTrip });
    } catch (error) {
      console.error('Error in updating review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// DELETE /api/past-trips/:id/review
router.delete('/deleteReview', requireAuth, async (req, res) => {
  try {
    const { id } = req.body;

    // Find the past trip by ID
    const pastTrip = await PastTrip.findById(id);

    if (!pastTrip) {
      return res.status(404).json({ message: 'Past trip not found' });
    }

    // Remove the review from the past trip
    pastTrip.review = undefined;

    // Save the updated past trip
    await pastTrip.save();

    // Return the updated past trip
    res.status(200).json({ pastTrip });
  } catch (error) {
    console.error('Error in removing review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


module.exports = router;