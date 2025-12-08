/**
 * Notification Service - Business logic for notifications
 */

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} = require('../models/Notification');
const { getUserById } = require('../models/User');

/**
 * Notification types
 */
const NOTIFICATION_TYPES = {
  STREAK_MILESTONE: 'streak_milestone',
  STREAK_REMINDER: 'streak_reminder',
  STREAK_BROKEN: 'streak_broken',
  CHALLENGE_COMPLETED: 'challenge_completed',
  CHALLENGE_ACCEPTED: 'challenge_accepted',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  EVENT_REMINDER: 'event_reminder',
  POINTS_MILESTONE: 'points_milestone',
  LEVEL_UP: 'level_up',
};

/**
 * Create a notification
 */
const sendNotification = async (userId, type, data) => {
  const notification = await createNotification({
    userId,
    type,
    title: data.title,
    body: data.body,
    data: data.data || {},
    priority: data.priority || 'normal',
  });

  // TODO: Send push notification via FCM/Expo Push Notifications
  // For now, we just store it in Firestore

  return notification;
};

/**
 * Send streak milestone notification
 */
const sendStreakMilestone = async (userId, streakCount) => {
  const user = await getUserById(userId);
  
  let title, body;
  if (streakCount === 7) {
    title = '🔥 7 Day Streak!';
    body = `Amazing! You've maintained a ${streakCount}-day streak. Keep it going!`;
  } else if (streakCount === 30) {
    title = '🔥🔥 30 Day Streak!';
    body = `Incredible! You've reached a ${streakCount}-day streak milestone!`;
  } else if (streakCount % 7 === 0) {
    title = `🔥 ${streakCount} Day Streak!`;
    body = `Congratulations on your ${streakCount}-day streak!`;
  } else {
    title = `🔥 Streak Update`;
    body = `You're on a ${streakCount}-day streak! Keep it up!`;
  }

  return await sendNotification(userId, NOTIFICATION_TYPES.STREAK_MILESTONE, {
    title,
    body,
    data: {
      streakCount,
      type: 'streak_milestone',
    },
    priority: 'high',
  });
};

/**
 * Send streak reminder notification
 */
const sendStreakReminder = async (userId) => {
  const user = await getUserById(userId);
  
  return await sendNotification(userId, NOTIFICATION_TYPES.STREAK_REMINDER, {
    title: '⏰ Don\'t Break Your Streak!',
    body: `You're on a ${user.currentStreak || 0}-day streak! Complete a challenge today to keep it going.`,
    data: {
      currentStreak: user.currentStreak || 0,
      type: 'streak_reminder',
    },
    priority: 'high',
  });
};

/**
 * Send streak broken notification
 */
const sendStreakBroken = async (userId, previousStreak) => {
  return await sendNotification(userId, NOTIFICATION_TYPES.STREAK_BROKEN, {
    title: '💔 Streak Broken',
    body: `Your ${previousStreak}-day streak has ended. Start a new one today!`,
    data: {
      previousStreak,
      type: 'streak_broken',
    },
    priority: 'normal',
  });
};

/**
 * Check and send streak notifications
 * This should be called when a user completes a challenge
 */
const checkStreakNotifications = async (userId) => {
  const user = await getUserById(userId);
  const currentStreak = user.currentStreak || 0;
  const previousStreak = user.longestStreak || 0;

  // Check for milestone
  if (currentStreak > 0 && (currentStreak === 7 || currentStreak === 30 || currentStreak % 7 === 0)) {
    await sendStreakMilestone(userId, currentStreak);
  }

  // Check if longest streak was broken
  if (currentStreak > previousStreak) {
    // New record! Could send special notification
    await sendStreakMilestone(userId, currentStreak);
  }

  return {
    currentStreak,
    longestStreak: user.longestStreak || 0,
  };
};

/**
 * Get user notifications
 */
const getUserNotificationsList = async (userId, options = {}) => {
  return await getUserNotifications(userId, options);
};

/**
 * Get unread count
 */
const getUnreadNotificationCount = async (userId) => {
  return await getUnreadCount(userId);
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId) => {
  return await markAsRead(notificationId);
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (userId) => {
  return await markAllAsRead(userId);
};

/**
 * Delete notification
 */
const deleteUserNotification = async (notificationId) => {
  return await deleteNotification(notificationId);
};

module.exports = {
  sendNotification,
  sendStreakMilestone,
  sendStreakReminder,
  sendStreakBroken,
  checkStreakNotifications,
  getUserNotificationsList,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  NOTIFICATION_TYPES,
};

