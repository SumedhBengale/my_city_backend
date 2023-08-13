const Notifications = require('../models/Notifications');
async function addNotification(userId, message) {
  try {
    // Find the user's notification document
    let userNotifications = await Notifications.findOne({ userId });

    if (!userNotifications) {
      // If the user's notification document doesn't exist, create a new one
      userNotifications = new Notifications({
        userId,
        notifications: [
          {
            message,
          },
        ],
      });
    } else {
      // If the user's notification document exists, add the new notification message
      userNotifications.notifications.push({
        message,
      });
    }

    // Save the updated or new notification document
    await userNotifications.save();
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error adding notification:', error);
    throw error;
  }
}

module.exports = {
  addNotification,
};
