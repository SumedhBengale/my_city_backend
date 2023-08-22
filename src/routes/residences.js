const express = require('express');
var request = require('request');
const axios = require('axios');
const router = express.Router();
const Residence = require('../models/Residence');
const { requireAuth } = require('../middlewares/authMiddleware');
const UpcomingTrip = require('../models/Trip');
const { addNotification } = require('../middlewares/notificationMiddleware');
const { fetchResidences, fetchResidenceById, fetchFinancials, fetchAvailability, fetchCities, fetchQuote } = require('../middlewares/guestyMiddleware');

router.get('/getResidences', async (req, res) => {
  try {

    const { filterData } = req.query;
    
    await fetchResidences(filterData).then((residences) => {
      // console.log("Residences: ", residences)
      res.status(200).json({ residences: residences, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    console.error('Error in getResidences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }


});


//Get a residence by id
router.get('/getResidence/:id', requireAuth, async (req, res) => {
  try {
    console.log("Getting residence by id");
    const { id } = req.params;

    await fetchResidenceById(id).then(async (residence) => {
      res.status(200).json({ residence: residence, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    console.error('Error in getResidence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Get residence financials
router.get('/getResidenceFinancials/:id', requireAuth, async (req, res) => {
  try {
    console.log("Getting residence financials");
    const { id } = req.params;

    await fetchFinancials(id).then((financials) => {
      res.status(200).json({ financials: financials, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    console.error('Error in getResidenceFinancials:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Get list of cities
router.get('/getCities', requireAuth, async (req, res) => {
  try {
    console.log("Getting cities");
    await fetchCities().then((cities) => {
      res.status(200).json({ cities: cities, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    console.error('Error in getCities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//getQuote
router.post('/getQuote', requireAuth, async (req, res) => {
  try {
    const { residenceId, checkInDate, checkOutDate, guestCount, userId } = req.body;

    console.log("residenceId", residenceId)
    console.log("checkInDate", checkInDate)
    console.log("checkOutDate", checkOutDate)
    console.log("numberOfGuests", guestCount)
    console.log("userId", userId)

    fetchQuote(residenceId, checkInDate, checkOutDate, guestCount).then((quote) => {
      console.log("Quote: ", quote);
      res.status(200).json({ quote: quote, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    })
  } catch (error) {
    console.error('Error in getQuote:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Book a residence
router.post('/bookResidence', requireAuth, async (req, res) => {
  try {
    const { residence, quote, checkInDate, checkOutDate, userId } = req.body;
    console.log("residence", residence)
    // Create a new upcoming trip
    const upcomingTrip = new UpcomingTrip({
      userId,
      residence,
      checkInDate,
      checkOutDate,
    });

    // Save the upcoming trip to the database
    await upcomingTrip.save();

    // Add a notification to the user
    
    addNotification(userId, 'Your booking has been confirmed');


    res.status(201).json({ upcomingTrip: upcomingTrip, status: 201 });

  } catch (error) {
    console.error('Error in adding upcoming trip:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/getBookedDates', requireAuth, async (req, res) => {

  try {
    const { residenceId, startDate, endDate } = req.body;
    console.log("residenceId", residenceId)
    console.log("startDate", startDate)
    console.log("endDate", endDate)



    fetchAvailability(residenceId, startDate, endDate).then((availability) => {
      console.log("Availability: ", availability);
      res.status(200).json({ availability: availability, status: 200 });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
        })
      } catch (error) {
        console.error('Error in getBookedDates:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });





//       // Get all the dates between checkInDate and checkOutDate
//       const dates = getDatesBetweenDates(checkInDate, checkOutDate);

//       // Add the dates to the list of booked dates
//       bookedDates = [...bookedDates, ...dates];

//       // Remove duplicate dates
//       bookedDates = [...new Set(bookedDates)];
//     });

//     // Return the booked dates
//     res.status(200).json({ bookedDates });
//   } catch (error) {
//     console.error('Error in retrieving booked dates:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });




module.exports = router;