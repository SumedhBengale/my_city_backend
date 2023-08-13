const express = require('express');
const router = express.Router();
const Residence = require('../models/Residence');
const { requireAuth } = require('../middlewares/authMiddleware');
const UpcomingTrip = require('../models/UpcomingTrip');
const { addNotification } = require('../middlewares/notificationMiddleware');

router.get('/getResidences', requireAuth, async (req, res) => {
  try {
    const { filterData } = req.query;
    const filter = {};

    if (filterData !== undefined) {
      try {
        // Parse the filterData string into a JavaScript object
        console.log(filterData);
        const parsedFilterData = JSON.parse(filterData);
        console.log("Parsed filter data: ", parsedFilterData);

        // Helper function to handle '+'
        const parseCount = (value) => {
          if (typeof value === 'string') {
            console.log("Value: ", value);
            const numericValue = parseInt(value, 10);
            if (value.endsWith('+')) {
              const numericPart = value.slice(0, -1); // Remove the '+'
              const numericValue = parseInt(numericPart, 10);
              if (!isNaN(numericValue)) {
                //Return greater than or equal to the numeric value
                return { $gte: numericValue };
              }
            }else if (!isNaN(numericValue)) {
              return numericValue;
            }
          }
          return undefined; // Return undefined if the value cannot be parsed
        };

        // Build the filter object based on the provided query parameters

        // Filter by bedrooms
        const bedrooms = parseCount(parsedFilterData.bedrooms);
        if (bedrooms !== undefined && bedrooms !== 'any') {
          filter.bedrooms = bedrooms;
        }

        // Filter by guests
        const guests = parseCount(parsedFilterData.guests);
        if (guests !== undefined && guests !== 'any') {
          filter.guests = guests;
        }

        // Filter by beds
        const beds = parseCount(parsedFilterData.beds);
        if (beds !== undefined && beds !== 'any') {
          filter.beds = beds;
        }

        // Filter by amenities
        if (
          parsedFilterData.amenities &&
          parsedFilterData.amenities.length > 0 &&
          !parsedFilterData.amenities.includes('any')
        ) {
          filter.amenities = { $in: parsedFilterData.amenities };
        }

        // Filter by price range
        if (
          parsedFilterData.priceRange &&
          parsedFilterData.priceRange.length === 2 &&
          parsedFilterData.priceRange[0] !== 'any' &&
          parsedFilterData.priceRange[1] !== 'any'
        ) {
          filter.pricePerNight = {
            $gte: parsedFilterData.priceRange[0],
            $lte: parsedFilterData.priceRange[1],
          };
        }
      } catch (parseError) {
        console.error('Error parsing filterData:', parseError);
        return res.status(400).json({ message: 'Invalid filter data' });
      }
    }

    console.log("Filter: ", filter);

    // Fetch the relevant residences from the MongoDB collection, give a limit of 10
    const residences = await Residence.find(filter).limit(10);

    // Return the filtered residences to the frontend
    res.status(200).json({ residences: residences, status: 200 });
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

    // Fetch the residence from the MongoDB collection
    const residence = await Residence.findById(id);

    // Return the residence to the frontend
    res.status(200).json({ residence: residence, status: 200 });

  } catch (error) {
    console.error('Error in getResidence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Book a residence
router.post('/bookResidence', requireAuth, async (req, res) => {
  try {
    const { residenceId, checkInDate, checkOutDate, userId } = req.body;

    // Create a new upcoming trip
    const upcomingTrip = new UpcomingTrip({
      userId,
      residenceId,
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



module.exports = router;