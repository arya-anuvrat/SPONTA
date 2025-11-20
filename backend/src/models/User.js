/**
 * User Model - Firestore operations for users collection
 */

const { db, admin } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { DEFAULTS } = require('../utils/constants');

const COLLECTION_NAME = 'users';

/**
 * Create a new user document
 */
const createUser = async (uid, userData) => {
  const userDoc = {
    uid,
    phoneNumber: userData.phoneNumber,
    email: userData.email || null,
    displayName: userData.displayName,
    dateOfBirth: userData.dateOfBirth instanceof Date 
      ? userData.dateOfBirth 
      : new Date(userData.dateOfBirth),
    location: userData.location || null,
    college: userData.college || { name: '', verified: false },
    profilePicture: userData.profilePicture || null,
    
    // Gamification defaults
    points: DEFAULTS.USER_POINTS,
    level: DEFAULTS.USER_LEVEL,
    currentStreak: DEFAULTS.STREAK_COUNT,
    longestStreak: DEFAULTS.STREAK_COUNT,
    lastActivityDate: null,
    
    // Social defaults
    friends: [],
    friendRequests: {
      sent: [],
      received: []
    },
    
    // Privacy defaults
    privacySettings: {
      showOnLeaderboard: true,
      allowFriendRequests: true,
      showLocation: true
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await db.collection(COLLECTION_NAME).doc(uid).set(userDoc);
  return userDoc;
};

/**
 * Get user by UID
 */
const getUserById = async (uid) => {
  const userDoc = await db.collection(COLLECTION_NAME).doc(uid).get();
  
  if (!userDoc.exists) {
    throw new NotFoundError('User');
  }
  
  return { id: userDoc.id, ...userDoc.data() };
};

/**
 * Update user document
 */
const updateUser = async (uid, updateData) => {
  const updateDoc = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  await db.collection(COLLECTION_NAME).doc(uid).update(updateDoc);
  return getUserById(uid);
};

/**
 * Get user by phone number
 */
const getUserByPhone = async (phoneNumber) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('phoneNumber', '==', phoneNumber)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Get multiple users by UIDs
 */
const getUsersByIds = async (uids) => {
  if (!uids || uids.length === 0) return [];
  
  // Firestore 'in' query limit is 10, so we need to batch
  const batches = [];
  for (let i = 0; i < uids.length; i += 10) {
    const batch = uids.slice(i, i + 10);
    batches.push(batch);
  }
  
  const promises = batches.map(batch =>
    db.collection(COLLECTION_NAME)
      .where('__name__', 'in', batch)
      .get()
  );
  
  const results = await Promise.all(promises);
  const users = [];
  
  results.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
  });
  
  return users;
};

/**
 * Update user points
 */
const updateUserPoints = async (uid, pointsToAdd) => {
  const userRef = db.collection(COLLECTION_NAME).doc(uid);
  await userRef.update({
    points: admin.firestore.FieldValue.increment(pointsToAdd),
    updatedAt: new Date(),
  });
  
  return getUserById(uid);
};

/**
 * Update user streak
 */
const updateUserStreak = async (uid, streakData) => {
  const updateDoc = {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    lastActivityDate: streakData.lastActivityDate,
    updatedAt: new Date(),
  };
  
  await db.collection(COLLECTION_NAME).doc(uid).update(updateDoc);
  return getUserById(uid);
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  getUserByPhone,
  getUsersByIds,
  updateUserPoints,
  updateUserStreak,
};

