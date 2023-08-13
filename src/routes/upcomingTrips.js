const express = require('express');
const UpcomingTrip = require('../models/UpcomingTrip');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/upcoming-trips
router.post('/getUpcomingTrips', requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Find all upcoming trips of the user
      const upcomingTrips = await UpcomingTrip.find({ userId });
  
      // Return the upcoming trips
      res.status(200).json({ upcomingTrips });
    } catch (error) {
      console.error('Error in retrieving upcoming trips:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// POST /api/upcoming-trips
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { residenceId, checkInDate, checkOutDate } = req.body;
    const { userId } = req.body;

    // Create a new upcoming trip
    const upcomingTrip = new UpcomingTrip({
      userId,
      residenceId,
      checkInDate,
      checkOutDate,
    });

    // Save the upcoming trip to the database
    await upcomingTrip.save();

    // Return the saved upcoming trip
    res.status(201).json({ upcomingTrip });
  } catch (error) {
    console.error('Error in adding upcoming trip:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//get all the upcoming trip's booked dates between checkInDate and checkOutDate for a residenceId
router.post('/getBookedDates', requireAuth, async (req, res) => {

  const getDatesBetweenDates = (startDate, endDate) => {
    let dates = []
    //to avoid modifying the original date
    const theDate = new Date(startDate)
    while (theDate < endDate) {
      dates = [...dates, new Date(theDate)]
      theDate.setDate(theDate.getDate() + 1)
    }
    dates = [...dates, endDate]
    return dates
  }


  try {
    const { residenceId } = req.body;
    console.log("residenceId", residenceId)

    // Find all upcoming trips of a residence
    const upcomingTrips = await UpcomingTrip.find({ residenceId });

    // Make a list of all the booked dates
    let bookedDates = [];
    upcomingTrips.forEach((upcomingTrip) => {
      const { checkInDate, checkOutDate } = upcomingTrip;

      // Get all the dates between checkInDate and checkOutDate
      const dates = getDatesBetweenDates(checkInDate, checkOutDate);

      // Add the dates to the list of booked dates
      bookedDates = [...bookedDates, ...dates];

      // Remove duplicate dates
      bookedDates = [...new Set(bookedDates)];
    });

    // Return the booked dates
    res.status(200).json({ bookedDates });
  } catch (error) {
    console.error('Error in retrieving booked dates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// DELETE /api/upcoming-trips/:id
router.post('/cancel', requireAuth, async (req, res) => {
    try {
      const { id } = req.body;
  
      // Find the upcoming trip by ID
      const upcomingTrip = await UpcomingTrip.findById(id);
  
      if (!upcomingTrip) {
        return res.status(404).json({ message: 'Upcoming trip not found' });
      }
  
      // Remove the upcoming trip
      await UpcomingTrip.findByIdAndRemove(id);
  
      // Return success message
      res.status(200).json({ message: 'Upcoming trip cancelled successfully' });
    } catch (error) {
      console.error('Error in cancelling upcoming trip:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
