const express = require('express');
const Notification = require('../models/Notifications');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const Notifications = require('../models/Notifications');

// GET /api/notifications
router.post('/get', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Retrieve the notifications for the user
    const notifications = await Notification.findOne({ userId });

    if (!notifications) {
      return res.status(404).json({ message: 'Notifications not found' });
    }

    // Return the notifications to the frontend
    res.status(200).json({ notifications: notifications.notifications });
  } catch (error) {
    console.error('Error in retrieving notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/notifications/add
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Find the user's notification
    const notification = await Notification.findOne({ userId });

    if (notification) {
      // If the user's notification exists, push the new notification to the array
      notification.notifications.push({ message });
      await notification.save();
    } else {
      // If the user's notification does not exist, create a new notification object
      const newNotification = new Notification({
        userId,
        notifications: [{ message }],
      });
      await newNotification.save();
    }

    // Return a success message
    res.status(201).json({ message: 'Notification added' });
  } catch (error) {
    console.error('Error in adding notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/notifications/delete/:notificationId
router.post('/delete', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user._id;

    // Find the user's notification
    const notification = await Notification.findOne({ userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Find the index of the notification in the notifications array
    const notificationIndex = notification.notifications.findIndex(
      (item) => item._id.toString() === notificationId
    );

    // If the notification doesn't exist, return without making any changes
    if (notificationIndex === -1) {
      return res.status(400).json({ message: 'Notification does not exist' });
    }

    // Remove the notification from the notifications array
    notification.notifications.splice(notificationIndex, 1);
    await notification.save();

    // Return a success message
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error in deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/notifications/setViewed
router.post('/setViewed', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user._id;

    // Find the user's notifications
    let notifications = await Notification.findOne({ userId });

    if (!notifications) {
      return res.status(404).json({ message: 'Notifications not found' });
    }

    //Find the notification and set viewed to true
    notifications.notifications.forEach((notification) => {
      if (notification._id.toString() === notificationId) {
        notification.viewed = true;
        console.log('Notification viewed');
      }
    }
    );

    console.log(notifications);

    await notifications.save();
  }
  catch (error) {
    console.error('Error in setting notification to viewed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
