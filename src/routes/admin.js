const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/authMiddleware');
const Chat = require('../models/Chat');
const Notifications = require('../models/Notifications');
const Trip = require('../models/Trip');
const Wishlist = require('../models/Wishlist');
const Residence = require('../models/Residence');
const { fetchResidenceById } = require('../middlewares/guestyMiddleware');
const ContactRequest = require('../models/ContactRequest');
const Enquiry = require('../models/Enquiry');



const router = express.Router();

router.post('/checkAdmin', async (req, res) => {
    const { token } = req.body;
    console.log(token)
    try {
        if (!token) return res.status(400).json({ message: 'Missing Token' });
        //Find the user by their token
        const jwt_User = jwt.verify(token, process.env.JWT_SECRET);
        //Get the user's type from the database
        const user = await User.findById(jwt_User.sub);
        console.log(user);
        if (user.type === 'admin') {
            return res.status(200).json({ message: 'User is an admin' });
        } else {
            return res.status(403).json({ message: 'User is not an admin' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to return the resource at given id
router.post('/resource/:id', requireAuth, async (req, res) => {
    try {
        const { typeOfResource, id } = req.body;
        console.log(typeOfResource, id)

        let resourceModel;

        switch (typeOfResource) {
            case 'user':
                resourceModel = User;
                break;
            case 'chat':
                resourceModel = Chat;
                break;
            case 'notifications':
                resourceModel = Notifications;
                break;
            case 'trip':
                resourceModel = Trip;
                break;
            case 'wishlist':
                resourceModel = Wishlist;
                break;
            case 'review':
                resourceModel = Trip;
                break;
            default:
                console.log("Invalid resource type", typeOfResource)
                return res.status(400).json({ message: 'Invalid resource type' });
        }
        let resource;
        if (resourceModel === Trip) {
            resource = await resourceModel.findById(id)

            const residence = await findResidenceById(resource.residenceId);
            //place the residence in the residenceId field
            resource.residenceId = residence;
        } else {
            resource = await resourceModel.findById(id);
        }
        let safeResource = resource;
        //If the resource is 'user' then remove password from the response
        switch (typeOfResource) {
            case 'user':
                safeResource = { ...resource._doc };
                delete safeResource.password, delete safeResource.__v, delete safeResource.createdAt, delete safeResource.updatedAt;
                break;
        }

        if (!resource) {
            return res.status(404).json({ message: `${typeOfResource} not found` });
        }
        console.log(safeResource)
        return res.status(200).json({ resource: safeResource });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to set the resource at given id
router.post('/resource/set/:id', requireAuth, async (req, res) => {
    try {
        const { typeOfResource, id, data } = req.body;
        console.log(typeOfResource, id)
        console.log("Data", data)

        let resourceModel;

        switch (typeOfResource) {
            case 'user':
                resourceModel = User;
                break;
            case 'chat':
                resourceModel = Chat;
                break;
            case 'notifications':
                resourceModel = Notifications;
                break;
            case 'trip':
                resourceModel = Trip;
                break;
            case 'wishlist':
                resourceModel = Wishlist;
                break;
            default:
                return res.status(400).json({ message: 'Invalid resource type' });
        }
        console.log(data)
        const updatedResource = await resourceModel.findOneAndUpdate({ _id: id }, data, { new: true });

        if (!updatedResource) {
            return res.status(404).json({ message: `${typeOfResource} not found` });
        }

        return res.status(200).json({ updatedResource });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

//Make routes to get all the Users, Wishlists, Chats depending on the Query the first route will be to get all the users
router.post('/users', async (req, res) => {
    try {
        const { query } = req.body;
        console.log("Query", query)

        // Perform the search query on the database
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        }).limit(10); // Limit the number of results to 10 for this example

        res.json(users);
        console.log(users)
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ error: 'Error searching for users' });
    }
});

//Route to search for all the chats depending on the query
router.post('/chats', async (req, res) => {
    try {
        const { query } = req.body;
        console.log("Query", query)

        // Perform the search query on the database
        let chats = await Chat.find({
            //Search for anything that matches the query in the messages
            $or: [
                { messages: { $elemMatch: { message: { $regex: query, $options: 'i' } } } },
            ],
        }).populate('userId');
        //Add a userName field to each chat, get the userName from the userId
        let newChats = chats;
        newChats = newChats.map((chat) => {
            //Add a userName field to each chat, get the userName from the userId
            const userName = chat.userId.userName;
            return { ...chat._doc, userName };
        });

        res.json(newChats);
        console.log(newChats)
    } catch (error) {
        console.error('Error searching for chats:', error);
        res.status(500).json({ error: 'Error searching for chats' });
    }
});

//route to get all trips depending on the query
router.post('/trips', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Query", userId)

        // Find all the trips of the user, and populate the residenceId field
        let trips = await Trip.find({ userId })


        res.status(200).json(trips);
        console.log(trips)
    } catch (error) {
        console.error('Error searching for Trips:', error);
        res.status(500).json({ error: 'Error searching for Trips' });
    }
});


//Get the latest reviews from all the users
router.post('/reviews', async (req, res) => {
    try {
        const { query, rating } = req.body;
        console.log("Query", query)
        console.log(rating)
        let trips;
        if (rating === '') {
            trips = await Trip.find({
                $and: [
                    { review: { $regex: query, $options: 'i' } },
                ],
            })
        } else {
            trips = await Trip.find({
                $and: [
                    { review: { $regex: query, $options: 'i' } },
                    { rating: rating },
                ],
            })
        }

        res.json(trips);
        console.log(trips)
    } catch (error) {
        console.error('Error searching for past trips:', error);
        res.status(500).json({ error: 'Error searching for past trips' });
    }
});


//Get all the wishlists for a user's id
router.post('/wishlist', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Query", userId)

        // Perform the search query on the database
        let wishlists = await Wishlist.find({ userId })


        res.json(wishlists);
        console.log(wishlists)
    } catch (error) {
        console.error('Error searching for wishlists:', error);
        res.status(500).json({ error: 'Error searching for wishlists' });
    }
});

router.get('/getRequests', requireAuth, async (req, res) => {
    try {
        const contactRequests = await ContactRequest.find().populate('userId')
        res.status(200).json({ contactRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving contact requests' });
    }
});

//GetEnquiries
router.get('/getEnquiries', requireAuth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        res.status(200).json({ enquiries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving contact requests' });
    }
});

//delete enquiry
router.post('/deleteEnquiry', requireAuth, async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id)
        const enquiry = await Enquiry.findByIdAndDelete(id);
        console.log(enquiry)
        res.status(200).json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the enquiry' });
    }
});

//deleteContactRequest
router.post('/deleteContactRequest', requireAuth, async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id)

        const deletedContactRequest = await ContactRequest.findByIdAndDelete(id);
        console.log(deletedContactRequest)

        res.status(200).json({ message: 'Contact request deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the contact request' });
    }
});

//Route to compare all upcoming trip's checkInDate and checkOutDate with the current date and if the current date is greater than the checkOutDate then move the upcoming trip to the past trip

// router.post('/upcomingTripsToPastTrips', async (req, res) => {
//     try {
//         // Perform the search query on the database
//         const upcomingTrips = await UpcomingTrip.find({});
//         console.log(upcomingTrips)
//         for (let i = 0; i < upcomingTrips.length; i++) {
//             const upcomingTrip = upcomingTrips[i];
//             const currentDate = new Date();
//             const checkOutDate = new Date(upcomingTrip.checkOutDate);
//             console.log(currentDate, checkOutDate)
//             if (currentDate > checkOutDate) {
//                 console.log("Moving to past trips")
//                 const pastTrip = new PastTrip({
//                     userId: upcomingTrip.userId,
//                     residenceId: upcomingTrip.residenceId,
//                     checkInDate: upcomingTrip.checkInDate,
//                     checkOutDate: upcomingTrip.checkOutDate,
//                 });
//                 await pastTrip.save();
//                 await UpcomingTrip.findByIdAndDelete(upcomingTrip._id);
//             }
//         }
//         res.status(200).json({ message: 'Upcoming trips moved to past trips' });
//     } catch (error) {
//         console.error('Error moving upcoming trips to past trips:', error);
//         res.status(500).json({ error: 'Error moving upcoming trips to past trips' });
//     }
// });

module.exports = router;
