/**
 * Event Service - Business logic for events
 */

const {
    createEvent,
    getEventById,
    getEvents,
    getNearbyEvents,
    updateEvent,
    addParticipant,
    removeParticipant,
} = require("../models/Event");
const { getUserById } = require("../models/User");
const { NotFoundError, ConflictError } = require("../utils/errors");

/**
 * Create an event
 */
const createNewEvent = async (data) => {
    return await createEvent(data);
};

/**
 * Get all events with optional filters
 */
const getAllEvents = async (filters = {}) => {
    return await getEvents(filters);
};

/**
 * Get event by ID
 */
const getEvent = async (eventId) => {
    return await getEventById(eventId);
};

/**
 * Get nearby events
 */
const getNearby = async (latitude, longitude, radius = 5000) => {
    if (!latitude || !longitude) {
        throw new Error("Latitude and longitude are required");
    }

    return await getNearbyEvents(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 5000
    );
};

/**
 * Update an event
 */
const updateEventDetails = async (eventId, data) => {
    // Ensure event exists
    await getEventById(eventId);
    return await updateEvent(eventId, data);
};

/**
 * Join an event
 */
const joinEvent = async (userId, eventId) => {
    const event = await getEventById(eventId);

    if (!event.isPublic) {
        throw new ConflictError("This event is private");
    }

    const alreadyJoined = event.participants?.includes(userId);
    if (alreadyJoined) {
        throw new ConflictError("User already joined this event");
    }

    const updatedEvent = await addParticipant(eventId, userId);

    return {
        event: updatedEvent,
    };
};

/**
 * Leave an event
 */
const leaveEvent = async (userId, eventId) => {
    // Ensure event exists
    const event = await getEventById(eventId);

    const wasMember = event.participants?.includes(userId);
    if (!wasMember) {
        throw new ConflictError("User is not a participant of this event");
    }

    const updatedEvent = await removeParticipant(eventId, userId);

    return {
        event: updatedEvent,
    };
};

module.exports = {
    createNewEvent,
    getAllEvents,
    getEvent,
    getNearby,
    updateEventDetails,
    joinEvent,
    leaveEvent,
};
