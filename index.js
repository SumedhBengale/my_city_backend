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
const { ensureAccessToken } = require('./src/middlewares/tokenManager');





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

app.use('/api', ensureAccessToken, userRoutes)

app.use('/api/admin', ensureAccessToken, adminRoutes);

app.use('/api',ensureAccessToken, authRoutes);

app.use('/api',ensureAccessToken, residencesRoutes);

app.use('/api/wishlist',ensureAccessToken, wishlistRoutes);

app.use('/api/notifications',ensureAccessToken, notificationRoutes);

app.use('/api/trips',ensureAccessToken, tripRoutes);

app.use('/api/chat',ensureAccessToken, chat)

// Start the server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
