const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/events
 * @desc    Get all events (with optional filters: status, isPublic, category)
 * @access  Public (optional auth)
 * @query   status, isPublic, category, page, limit
 */
router.get('/', optionalAuth, eventController.getAllEvents);

/**
 * @route   GET /api/events/nearby
 * @desc    Get nearby events
 * @access  Public (optional auth)
 * @query   lat, lng, radius (in meters, default 5000)
 */
router.get('/nearby', optionalAuth, eventController.getNearbyEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public (optional auth)
 */
router.get('/:id', optionalAuth, eventController.getEventById);

/**
 * @route   GET /api/events/:id/participants
 * @desc    Get event participants
 * @access  Public (optional auth)
 */
router.get('/:id/participants', optionalAuth, eventController.getEventParticipants);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private
 * @body    { title, description, startTime, endTime, location, category, ... }
 */
router.post('/', authenticateToken, eventController.createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event (only creator)
 * @access  Private
 */
router.put('/:id', authenticateToken, eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event (only creator)
 * @access  Private
 */
router.delete('/:id', authenticateToken, eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/join
 * @desc    Join an event
 * @access  Private
 */
router.post('/:id/join', authenticateToken, eventController.joinEvent);

/**
 * @route   POST /api/events/:id/leave
 * @desc    Leave an event
 * @access  Private
 */
router.post('/:id/leave', authenticateToken, eventController.leaveEvent);

module.exports = router;
