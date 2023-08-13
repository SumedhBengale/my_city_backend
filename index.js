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
const pastTrips = require('./src/routes/pastTrips');
const upcomingTrips = require('./src/routes/upcomingTrips');
const chat = require('./src/routes/chat');
const userRoutes = require('./src/routes/user');





const app = express();
const PORT = 5000; // You can use any desired port number
app.use(cors());


// Connect to MongoDB
connectToDatabase();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Define your routes here

app.use('/api', userRoutes)

app.use('/api/admin', adminRoutes);

app.use('/api', authRoutes);

app.use('/api', residencesRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/pastTrips', pastTrips);

app.use('/api/upcomingTrips', upcomingTrips);

app.use('/api/chat', chat)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
