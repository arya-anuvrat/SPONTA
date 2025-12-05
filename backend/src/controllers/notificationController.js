/**
 * Notification Controller
 */

const notificationService = require('../services/notificationService');

/**
 * Get user's notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { unreadOnly, limit } = req.query;
    
    const notifications = await notificationService.getUserNotificationsList(uid, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 50,
    });
    
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread/count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const count = await notificationService.getUnreadNotificationCount(uid);
    
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.markNotificationAsRead(id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const count = await notificationService.markAllNotificationsAsRead(uid);
    
    res.status(200).json({
      success: true,
      message: `Marked ${count} notifications as read`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.deleteUserNotification(id);
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send streak reminder (for testing/scheduling)
 * POST /api/notifications/streak-reminder
 */
const sendStreakReminder = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const notification = await notificationService.sendStreakReminder(uid);
    
    res.status(200).json({
      success: true,
      message: 'Streak reminder sent',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendStreakReminder,
};

