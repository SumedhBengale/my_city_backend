const express = require('express');
const connectToDatabase = require('./src/config/database');
require('dotenv').config();
const cors = require('cors');

const adminRoutes = require('./src/routes/admin');
const authRoutes = require('./src/routes/auth');
const passport = require('./src/middlewares/passport');
const { requireAuth } = require('./src/middlewares/authMiddleware');
const residencesRoutes = require('./src/routes/residences');
const wishlistRoutes = require('./src/routes/wishlist');
const notificationRoutes = require('./src/routes/notification');
const tripRoutes = require('./src/routes/Trips');
const chat = require('./src/routes/chat');
const userRoutes = require('./src/routes/user');
const contactRoutes = require('./src/routes/contact');
const enquiryRoutes = require('./src/routes/enquiry')
const stripeRoutes = require('./src/routes/stripe');
const { ensureAccessToken, fetchAccessToken } = require('./src/middlewares/tokenManager');
const cron = require('node-cron');


const app = express();
const PORT = 5000; // You can use any desired port number
app.use(cors());


// Connect to MongoDB
connectToDatabase();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

//Run this code every 20 hours, use cron

cron.schedule('0 */20 * * *', () => {
  console.log('Fetching Access Token every 20 hours to be safe');
  fetchAccessToken();
});

// Define your routes here

app.use('/api', userRoutes)

app.use('/api/admin', adminRoutes);

app.use('/api', authRoutes);

app.use('/api', residencesRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/trips', tripRoutes);

app.use('/api/chat', chat)

app.use('/api/contact', contactRoutes);

app.use('/api/enquiry', enquiryRoutes);

app.use('/api', stripeRoutes);


// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
