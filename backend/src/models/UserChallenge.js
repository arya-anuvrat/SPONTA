/**
 * UserChallenge Model - Firestore operations for userChallenges collection
 */

const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { USER_CHALLENGE_STATUS } = require('../utils/constants');

const COLLECTION_NAME = 'userChallenges';

/**
 * Create a new user challenge relationship
 */
const createUserChallenge = async (userChallengeData) => {
  const userChallengeDoc = {
    userId: userChallengeData.userId,
    challengeId: userChallengeData.challengeId,
    status: userChallengeData.status || USER_CHALLENGE_STATUS.ACCEPTED,
    acceptedAt: new Date(),
    completedAt: null,

    // Data for completion
    photoUrl: userChallengeData.photoUrl || null,
    location: userChallengeData.location || null,

    // Verification fields used by AI pipeline
    verified: false,
    verifiedAt: null,
    verifiedBy: null,

    pointsEarned: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(userChallengeDoc);
  return { id: docRef.id, ...userChallengeDoc };
};

/**
 * Get user challenge by ID
 */
const getUserChallengeById = async (userChallengeId) => {
  const doc = await db.collection(COLLECTION_NAME).doc(userChallengeId).get();

  if (!doc.exists) {
    throw new NotFoundError('User challenge');
  }

  return { id: doc.id, ...doc.data() };
};

/**
 * Get user challenge by user ID and challenge ID
 */
const getUserChallenge = async (userId, challengeId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .where('challengeId', '==', challengeId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Get all challenges for a user
 */
const getUserChallenges = async (userId, filters = {}) => {
  let query = db.collection(COLLECTION_NAME).where('userId', '==', userId);

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get all users who accepted/completed a challenge
 */
const getChallengeUsers = async (challengeId, filters = {}) => {
  let query = db.collection(COLLECTION_NAME).where('challengeId', '==', challengeId);

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update user challenge (generic updates)
 */
const updateUserChallenge = async (userChallengeId, updateData) => {
  const updateDoc = {
    ...updateData,
    updatedAt: new Date(),
  };

  // Normalize date values coming from controller/UI
  if (updateDoc.completedAt && typeof updateDoc.completedAt === 'string') {
    updateDoc.completedAt = new Date(updateDoc.completedAt);
  }
  if (updateDoc.verifiedAt && typeof updateDoc.verifiedAt === 'string') {
    updateDoc.verifiedAt = new Date(updateDoc.verifiedAt);
  }

  await db.collection(COLLECTION_NAME).doc(userChallengeId).update(updateDoc);
  return getUserChallengeById(userChallengeId);
};

/**
 * Complete a user challenge — now supports AI verification pipeline
 * Only marks as COMPLETED if verified is true, otherwise keeps as ACCEPTED
 */
const completeUserChallenge = async (userChallengeId, completionData) => {
  const isVerified = completionData.verified === true;
  
  const updateDoc = {
    // Only mark as completed if verified, otherwise keep as accepted
    status: isVerified ? USER_CHALLENGE_STATUS.COMPLETED : USER_CHALLENGE_STATUS.ACCEPTED,
    completedAt: isVerified ? new Date() : null,

    // Values sent from Challenge Service
    photoUrl: completionData.photoUrl || null,
    location: completionData.location || null,

    // AI verification fields
    verified: isVerified,
    verifiedAt: isVerified ? new Date() : null,
    verifiedBy: isVerified ? (completionData.verifiedBy || null) : null,

    pointsEarned: isVerified ? (completionData.pointsEarned || 0) : 0,
    updatedAt: new Date(),
  };

  await db.collection(COLLECTION_NAME).doc(userChallengeId).update(updateDoc);
  return getUserChallengeById(userChallengeId);
};

module.exports = {
  createUserChallenge,
  getUserChallengeById,
  getUserChallenge,
  getUserChallenges,
  getChallengeUsers,
  updateUserChallenge,
  completeUserChallenge,
};
