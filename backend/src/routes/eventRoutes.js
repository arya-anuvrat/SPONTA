const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (admin or verified users eventually)
 */
router.post("/", authenticateToken, eventController.createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events (filters: status, isPublic, category)
 * @access  Public
 */
router.get("/", optionalAuth, eventController.getEvents);

/**
 * @route   GET /api/events/nearby
 * @desc    Get events near user location
 * @access  Public
 */
router.get("/nearby", optionalAuth, eventController.getNearbyEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get("/:id", optionalAuth, eventController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private
 */
router.put("/:id", authenticateToken, eventController.updateEvent);

/**
 * @route   POST /api/events/:id/join
 * @desc    Join an event
 * @access  Private
 */
router.post("/:id/join", authenticateToken, eventController.joinEvent);

/**
 * @route   POST /api/events/:id/leave
 * @desc    Leave an event
 * @access  Private
 */
router.post("/:id/leave", authenticateToken, eventController.leaveEvent);

module.exports = router;
