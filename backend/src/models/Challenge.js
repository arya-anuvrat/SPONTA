/**
 * Challenge Model - Firestore operations for challenges collection
 */

const { db, admin } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');

const COLLECTION_NAME = 'challenges';

/**
 * Create a new challenge
 */
const createChallenge = async (challengeData) => {
  const challengeDoc = {
    ...challengeData,
    isActive: challengeData.isActive !== undefined ? challengeData.isActive : true,
    isFeatured: challengeData.isFeatured || false,
    totalCompletions: 0,
    totalAccepts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Convert date strings to timestamps
  if (challengeDoc.startDate && typeof challengeDoc.startDate === 'string') {
    challengeDoc.startDate = new Date(challengeDoc.startDate);
  }
  if (challengeDoc.endDate && typeof challengeDoc.endDate === 'string') {
    challengeDoc.endDate = new Date(challengeDoc.endDate);
  }
  
  const docRef = await db.collection(COLLECTION_NAME).add(challengeDoc);
  return { id: docRef.id, ...challengeDoc };
};

/**
 * Get challenge by ID
 */
const getChallengeById = async (challengeId) => {
  const challengeDoc = await db.collection(COLLECTION_NAME).doc(challengeId).get();
  
  if (!challengeDoc.exists) {
    throw new NotFoundError('Challenge');
  }
  
  return { id: challengeDoc.id, ...challengeDoc.data() };
};

/**
 * Get all active challenges
 */
const getActiveChallenges = async (filters = {}) => {
  let query = db.collection(COLLECTION_NAME).where('isActive', '==', true);
  
  // Apply filters
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  
  if (filters.difficulty) {
    query = query.where('difficulty', '==', filters.difficulty);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get nearby challenges (requires location)
 */
const getNearbyChallenges = async (latitude, longitude, radiusInMeters = 5000) => {
  // Note: Firestore doesn't support geospatial queries natively
  // This is a simplified version. For production, consider using GeoFirestore or similar
  const allChallenges = await getActiveChallenges();
  
  // Filter challenges that have location data
  const challengesWithLocation = allChallenges.filter(
    challenge => challenge.location?.coordinates
  );
  
  // Calculate distance and filter by radius
  const nearbyChallenges = challengesWithLocation
    .map(challenge => {
      const { latitude: lat, longitude: lng } = challenge.location.coordinates;
      const distance = calculateDistance(latitude, longitude, lat, lng);
      return { ...challenge, distance };
    })
    .filter(challenge => challenge.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);
  
  return nearbyChallenges;
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
 * Update challenge
 */
const updateChallenge = async (challengeId, updateData) => {
  const updateDoc = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  await db.collection(COLLECTION_NAME).doc(challengeId).update(updateDoc);
  return getChallengeById(challengeId);
};

/**
 * Increment challenge accept count
 */
const incrementAcceptCount = async (challengeId) => {
  await db.collection(COLLECTION_NAME).doc(challengeId).update({
    totalAccepts: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date(),
  });
};

/**
 * Increment challenge completion count
 */
const incrementCompletionCount = async (challengeId) => {
  await db.collection(COLLECTION_NAME).doc(challengeId).update({
    totalCompletions: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date(),
  });
};

module.exports = {
  createChallenge,
  getChallengeById,
  getActiveChallenges,
  getNearbyChallenges,
  updateChallenge,
  incrementAcceptCount,
  incrementCompletionCount,
};

