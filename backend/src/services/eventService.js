/**
 * Event Service - Business logic for events
 */

const {
  getEventById,
  getEvents,
  getNearbyEvents,
  createEvent,
  updateEvent,
  addParticipant,
  removeParticipant,
} = require('../models/Event');
const { validateEventSchema } = require('../models/schemas');
const { NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const { EVENT_STATUS } = require('../utils/constants');

/**
 * Get all events with filters
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
    throw new Error('Latitude and longitude are required');
  }
  
  return await getNearbyEvents(
    parseFloat(latitude),
    parseFloat(longitude),
    parseInt(radius) || 5000
  );
};

/**
 * Create a new event
 */
const createNewEvent = async (userId, eventData) => {
  // Validate event data
  const validatedData = validateEventSchema(eventData);
  
  // Set creator
  const eventWithCreator = {
    ...validatedData,
    createdBy: userId,
    participants: [userId], // Creator is automatically a participant
  };
  
  return await createEvent(eventWithCreator);
};

/**
 * Update event
 */
const updateEventData = async (userId, eventId, updateData) => {
  const event = await getEventById(eventId);
  
  // Only creator can update
  if (event.createdBy !== userId) {
    throw new ForbiddenError('Only event creator can update the event');
  }
  
  // Validate update data
  const validatedData = validateEventSchema(updateData, true);
  
  return await updateEvent(eventId, validatedData);
};

/**
 * Join an event
 */
const joinEvent = async (userId, eventId) => {
  const event = await getEventById(eventId);
  
  // Check if event is public or user is already a participant
  if (!event.isPublic && event.createdBy !== userId && !event.participants.includes(userId)) {
    throw new ForbiddenError('Event is private');
  }
  
  // Check if already a participant
  if (event.participants && event.participants.includes(userId)) {
    throw new ConflictError('Already a participant in this event');
  }
  
  // Check if event is full
  if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
    throw new ConflictError('Event is full');
  }
  
  // Check if event status allows joining
  if (event.status !== EVENT_STATUS.UPCOMING) {
    throw new ConflictError('Cannot join event that is not upcoming');
  }
  
  return await addParticipant(eventId, userId);
};

/**
 * Leave an event
 */
const leaveEvent = async (userId, eventId) => {
  const event = await getEventById(eventId);
  
  // Check if user is a participant
  if (!event.participants || !event.participants.includes(userId)) {
    throw new NotFoundError('Not a participant in this event');
  }
  
  // Creator cannot leave (they can delete the event instead)
  if (event.createdBy === userId) {
    throw new ConflictError('Event creator cannot leave. Delete the event instead.');
  }
  
  return await removeParticipant(eventId, userId);
};

/**
 * Delete event
 */
const deleteEvent = async (userId, eventId) => {
  const event = await getEventById(eventId);
  
  // Only creator can delete
  if (event.createdBy !== userId) {
    throw new ForbiddenError('Only event creator can delete the event');
  }
  
  // In Firestore, we'll mark it as cancelled instead of deleting
  return await updateEvent(eventId, { status: EVENT_STATUS.CANCELLED });
};

/**
 * Get event participants
 */
const getEventParticipants = async (eventId) => {
  const event = await getEventById(eventId);
  
  if (!event.participants || event.participants.length === 0) {
    return [];
  }
  
  // Import here to avoid circular dependency
  const { getUsersByIds } = require('../models/User');
  const participants = await getUsersByIds(event.participants);
  
  return participants.map(user => ({
    uid: user.uid,
    displayName: user.displayName,
    profilePicture: user.profilePicture,
  }));
};

module.exports = {
  getAllEvents,
  getEvent,
  getNearby,
  createNewEvent,
  updateEventData,
  joinEvent,
  leaveEvent,
  deleteEvent,
  getEventParticipants,
};

