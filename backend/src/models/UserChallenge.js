/**
 * UserChallenge Model - Firestore operations for userChallenges collection
 */

const { db, admin } = require('../config/firebase');
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

    // Streak tracking - AI-generated challenges don't count for streaks
    countsForStreak: userChallengeData.countsForStreak !== undefined 
      ? userChallengeData.countsForStreak 
      : true, // Default to true (counts for streak) unless explicitly set to false

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
  // Strict boolean check - only true if explicitly boolean true
  const isVerified = completionData.verified === true;
  
  console.log('🔍 completeUserChallenge debug:', {
    userChallengeId,
    completionDataVerified: completionData.verified,
    completionDataVerifiedType: typeof completionData.verified,
    isVerified,
  });
  
  const updateDoc = {
    // Only mark as completed if verified, otherwise keep as accepted
    status: isVerified ? USER_CHALLENGE_STATUS.COMPLETED : USER_CHALLENGE_STATUS.ACCEPTED,
    completedAt: isVerified ? admin.firestore.Timestamp.now() : null,

    // Values sent from Challenge Service
    photoUrl: completionData.photoUrl || null,
    location: completionData.location || null,

    // AI verification fields - ensure boolean
    verified: isVerified ? true : false, // Explicit boolean, not truthy
    verifiedAt: isVerified ? admin.firestore.Timestamp.now() : null,
    verifiedBy: isVerified ? (completionData.verifiedBy || null) : null,
    aiConfidence: completionData.aiConfidence || null,
    aiReasoning: completionData.aiReasoning || null,

    pointsEarned: isVerified ? (completionData.pointsEarned || 0) : 0,
    updatedAt: admin.firestore.Timestamp.now(),
  };
  
  console.log('📝 Updating userChallenge with:', {
    status: updateDoc.status,
    verified: updateDoc.verified,
    verifiedType: typeof updateDoc.verified,
  });

  await db.collection(COLLECTION_NAME).doc(userChallengeId).update(updateDoc);
  const result = await getUserChallengeById(userChallengeId);
  
  console.log('✅ UserChallenge updated, result:', {
    status: result.status,
    verified: result.verified,
    verifiedType: typeof result.verified,
  });
  
  return result;
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
