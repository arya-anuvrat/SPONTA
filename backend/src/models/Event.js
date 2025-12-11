/**
 * Event Model - Firestore operations for events collection
 */

const { db, admin } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');

const COLLECTION_NAME = 'events';

/**
 * Create a new event
 */
const createEvent = async (eventData) => {
  const eventDoc = {
    ...eventData,
    createdBy: eventData.createdBy || eventData.userId || null,
    userId: eventData.userId || eventData.createdBy || null,
    participants: eventData.participants || [],
    status: eventData.status || 'upcoming',
    isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true,
    tags: eventData.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Convert date strings to timestamps
  if (eventDoc.startTime && typeof eventDoc.startTime === 'string') {
    eventDoc.startTime = new Date(eventDoc.startTime);
  }
  if (eventDoc.endTime && typeof eventDoc.endTime === 'string') {
    eventDoc.endTime = new Date(eventDoc.endTime);
  }
  
  const docRef = await db.collection(COLLECTION_NAME).add(eventDoc);
  return { id: docRef.id, ...eventDoc };
};

/**
 * Get event by ID
 */
const getEventById = async (eventId) => {
  const eventDoc = await db.collection(COLLECTION_NAME).doc(eventId).get();
  
  if (!eventDoc.exists) {
    throw new NotFoundError('Event');
  }
  
  return { id: eventDoc.id, ...eventDoc.data() };
};

/**
 * Get all events with filters
 */
const getEvents = async (filters = {}) => {
  let query = db.collection(COLLECTION_NAME);
  
  // Apply filters - but avoid multiple where clauses with orderBy to prevent index requirement
  // If we have filters, we'll fetch all and filter client-side, then sort
  const hasFilters = filters.status || filters.isPublic !== undefined || filters.category;
  
  if (!hasFilters) {
    // No filters - can use orderBy directly
    query = query.orderBy('startTime', 'asc');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // Has filters - apply them but don't use orderBy (will sort client-side)
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  
  if (filters.isPublic !== undefined) {
    query = query.where('isPublic', '==', filters.isPublic);
  }
  
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  
  const snapshot = await query.get();
  let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort client-side by start time
  events.sort((a, b) => {
    const aTime = a.startTime?.toDate?.() || new Date(a.startTime || 0);
    const bTime = b.startTime?.toDate?.() || new Date(b.startTime || 0);
    return aTime - bTime;
  });
  
  return events;
};

/**
 * Get nearby events (requires location)
 */
const getNearbyEvents = async (latitude, longitude, radiusInMeters = 5000) => {
  const allEvents = await getEvents({ status: 'upcoming', isPublic: true });
  
  // Filter events that have location data
  const eventsWithLocation = allEvents.filter(
    event => event.location?.coordinates
  );
  
  // Calculate distance and filter by radius
  const nearbyEvents = eventsWithLocation
    .map(event => {
      const { latitude: lat, longitude: lng } = event.location.coordinates;
      const distance = calculateDistance(latitude, longitude, lat, lng);
      return { ...event, distance };
    })
    .filter(event => event.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);
  
  return nearbyEvents;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Update event
 */
const updateEvent = async (eventId, updateData) => {
  const updateDoc = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  await db.collection(COLLECTION_NAME).doc(eventId).update(updateDoc);
  return getEventById(eventId);
};

/**
 * Add participant to event
 */
const addParticipant = async (eventId, userId) => {
  await db.collection(COLLECTION_NAME).doc(eventId).update({
    participants: admin.firestore.FieldValue.arrayUnion(userId),
    updatedAt: new Date(),
  });
  
  return getEventById(eventId);
};

/**
 * Remove participant from event
 */
const removeParticipant = async (eventId, userId) => {
  await db.collection(COLLECTION_NAME).doc(eventId).update({
    participants: admin.firestore.FieldValue.arrayRemove(userId),
    updatedAt: new Date(),
  });
  
  return getEventById(eventId);
};

module.exports = {
  createEvent,
  getEventById,
  getEvents,
  getNearbyEvents,
  updateEvent,
  addParticipant,
  removeParticipant,
};

