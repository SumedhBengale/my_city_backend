const express = require('express');
const Trip = require('../models/Trip');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/upcoming-trips
router.post('/getTrips', requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Find all upcoming trips of the user
      const trips = await Trip.find({ userId });
  
      // Return the upcoming trips
      res.status(200).json({ trips });
    } catch (error) {
      console.error('Error in retrieving trips:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// POST /api/upcoming-trips
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { residence, checkInDate, checkOutDate } = req.body;
    const { userId } = req.body;

    // Create a new upcoming trip
    const trip = new Trip({
      userId,
      residence,
      checkInDate,
      checkOutDate,
    });

    // Save the upcoming trip to the database
    await trip.save();

    // Return the saved upcoming trip
    res.status(201).json({ trip });
  } catch (error) {
    console.error('Error in adding trip:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/upcoming-trips/:id
router.post('/cancel', requireAuth, async (req, res) => {
    try {
      const { id } = req.body;
  
      // Find the upcoming trip by ID
      const trip = await Trip.findById(id);
  
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
  
      // Remove the upcoming trip
      await Trip.findByIdAndRemove(id);
  
      // Return success message
      res.status(200).json({ message: 'Trip cancelled successfully' });
    } catch (error) {
      console.error('Error in cancelling Trip:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/addReview', requireAuth, async (req, res) => {
    try {
      const { id, rating, review } = req.body;
      // Find the past trip by ID
      const trip = await Trip.findById(id);
  
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
  
      // Add the review to the past trip
      trip.review = review;
      trip.rating = rating;
  
      // Save the updated past trip
      await trip.save();
  
      // Return the updated past trip
      res.status(200).json({ trip });
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
