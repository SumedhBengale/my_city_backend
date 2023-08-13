const Notification = require('../models/Notifications');

const getNotificationsByUserId = async (userId) => {
  const notification = await Notification.findOne({ userId });
  return notification ? notification.notifications : [];
};

const createNotification = async (userId, message) => {
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
};

export { getNotificationsByUserId, createNotification };