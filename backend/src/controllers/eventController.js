/**
 * Event Controller
 */

const eventModel = require("../services/eventService");
const { validatePagination } = require("../utils/validators");

/**
 * Create event
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
    try {
        const eventData = req.body;
        const event = await eventModel.createEvent(eventData);

        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all events
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
    try {
        const { status, isPublic, category, page, limit } = req.query;

        const pagination = validatePagination(page, limit);

        const filters = {};
        if (status) filters.status = status;
        if (isPublic !== undefined) filters.isPublic = isPublic === "true";
        if (category) filters.category = category;

        const events = await eventModel.getEvents(filters);

        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        const data = events.slice(start, end);

        res.status(200).json({
            success: true,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: events.length,
                totalPages: Math.ceil(events.length / pagination.limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get event by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await eventModel.getEventById(id);

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get nearby events
 * GET /api/events/nearby
 */
const getNearbyEvents = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: "ValidationError",
                message: "Latitude and longitude are required",
            });
        }

        const events = await eventModel.getNearbyEvents(
            parseFloat(lat),
            parseFloat(lng),
            radius ? parseInt(radius) : undefined
        );

        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update event
 * PUT /api/events/:id
 */
const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await eventModel.updateEvent(id, updateData);

        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add participant
 * POST /api/events/:id/join
 */
const joinEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        const updated = await eventModel.addParticipant(id, uid);

        res.status(200).json({
            success: true,
            message: "Joined event successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove participant
 * POST /api/events/:id/leave
 */
const leaveEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        const updated = await eventModel.removeParticipant(id, uid);

        res.status(200).json({
            success: true,
            message: "Left event successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    getNearbyEvents,
    updateEvent,
    joinEvent,
    leaveEvent,
};
