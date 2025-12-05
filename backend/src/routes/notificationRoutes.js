const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 * @query   unreadOnly (true/false), limit (number)
 */
router.get('/', authenticateToken, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread/count', authenticateToken, notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

/**
 * @route   POST /api/notifications/streak-reminder
 * @desc    Send streak reminder (for testing/scheduling)
 * @access  Private
 */
router.post('/streak-reminder', authenticateToken, notificationController.sendStreakReminder);

module.exports = router;

