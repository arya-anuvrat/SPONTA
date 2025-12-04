/**
 * Event Controller
 */

const eventService = require('../services/eventService');
const { validatePagination } = require('../utils/validators');

/**
 * Get all events
 * GET /api/events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { status, isPublic, category, page, limit } = req.query;
    
    // Validate pagination
    const pagination = validatePagination(page, limit);
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
    if (category) filters.category = category;
    
    const events = await eventService.getAllEvents(filters);
    
    // Simple pagination
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedEvents = events.slice(start, end);
    
    res.status(200).json({
      success: true,
      data: paginatedEvents,
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
    const event = await eventService.getEvent(id);
    
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
        error: 'ValidationError',
        message: 'Latitude and longitude are required',
      });
    }
    
    const events = await eventService.getNearby(lat, lng, radius);
    
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create event
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const eventData = req.body;
    
    const event = await eventService.createNewEvent(uid, eventData);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
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
    const { uid } = req.user;
    const updateData = req.body;
    
    const event = await eventService.updateEventData(uid, id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 * DELETE /api/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    await eventService.deleteEvent(uid, id);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join event
 * POST /api/events/:id/join
 */
const joinEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const event = await eventService.joinEvent(uid, id);
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined event',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave event
 * POST /api/events/:id/leave
 */
const leaveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const event = await eventService.leaveEvent(uid, id);
    
    res.status(200).json({
      success: true,
      message: 'Successfully left event',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event participants
 * GET /api/events/:id/participants
 */
const getEventParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const participants = await eventService.getEventParticipants(id);
    
    res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
};

