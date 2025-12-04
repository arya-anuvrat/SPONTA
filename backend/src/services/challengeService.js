/**
 * Challenge Service - Business logic for challenges
 */

const {
  getChallengeById,
  getActiveChallenges,
  getNearbyChallenges,
  incrementAcceptCount,
  incrementCompletionCount,
} = require('../models/Challenge');
const {
  createUserChallenge,
  getUserChallenge,
  getUserChallenges,
  completeUserChallenge,
} = require('../models/UserChallenge');
const { getUserById, updateUserPoints } = require('../models/User');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { USER_CHALLENGE_STATUS, POINTS } = require('../utils/constants');
const { updateStreak } = require('./streakService');
const { verifyChallengePhoto } = require("./aiVerificationService");


/**
 * Get all challenges with optional filters
 */
const getAllChallenges = async (filters = {}) => {
  return await getActiveChallenges(filters);
};

/**
 * Get challenge by ID
 */
const getChallenge = async (challengeId) => {
  return await getChallengeById(challengeId);
};

/**
 * Get nearby challenges
 */
const getNearby = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }
  
  return await getNearbyChallenges(
    parseFloat(latitude),
    parseFloat(longitude),
    parseInt(radius) || 5000
  );
};

/**
 * Accept a challenge
 */
const acceptChallenge = async (userId, challengeId) => {
  // Check if challenge exists
  const challenge = await getChallengeById(challengeId);
  
  // Check if user already accepted this challenge
  const existingUserChallenge = await getUserChallenge(userId, challengeId);
  if (existingUserChallenge) {
    throw new ConflictError('Challenge already accepted');
  }
  
  // Create user-challenge relationship
  const userChallenge = await createUserChallenge({
    userId,
    challengeId,
    status: USER_CHALLENGE_STATUS.ACCEPTED,
  });
  
  // Increment challenge accept count
  await incrementAcceptCount(challengeId);
  
  return {
    userChallenge,
    challenge,
  };
};

/**
 * Complete a challenge
 */
const completeChallenge = async (userId, challengeId, completionData) => {
  // Check if challenge exists
  const challenge = await getChallengeById(challengeId);

  // Get user challenge relationship
  const userChallenge = await getUserChallenge(userId, challengeId);
  if (!userChallenge) {
    throw new NotFoundError('Challenge not accepted. Please accept the challenge first.');
  }

  if (userChallenge.status === USER_CHALLENGE_STATUS.COMPLETED) {
    throw new ConflictError('Challenge already completed');
  }

  // ⭐ NEW: Run AI verification BEFORE completion ⭐
  const { photoUrl, location } = completionData;

  const aiResult = await verifyChallengePhoto({
    challenge,
    photoUrl,
    location,
  });

  // Calculate points earned
  const pointsEarned = challenge.points || POINTS.CHALLENGE_COMPLETE;

  // ⭐ Use AI verification result in your completion update ⭐
  const completed = await completeUserChallenge(userChallenge.id, {
    photoUrl: photoUrl || null,
    location: location || null,
    verified: aiResult.verified,
    verifiedBy: "AI",
    aiConfidence: aiResult.confidence,
    aiReasoning: aiResult.reasoning,
    pointsEarned,
  });

  // Update user points
  await updateUserPoints(userId, pointsEarned);

  // Update user streak
  await updateStreak(userId);

  // Increment challenge completion count
  await incrementCompletionCount(challengeId);

  return {
    userChallenge: completed,
    challenge,
    pointsEarned,
    aiVerification: aiResult, // optional: return to frontend
  };
};


/**
 * Get user's challenges
 */
const getUserChallengesList = async (userId, filters = {}) => {
  return await getUserChallenges(userId, filters);
};

/**
 * Get user's progress on a specific challenge
 */
const getUserChallengeProgress = async (userId, challengeId) => {
  const challenge = await getChallengeById(challengeId);
  const userChallenge = await getUserChallenge(userId, challengeId);
  
  return {
    challenge,
    userChallenge: userChallenge || null,
    hasAccepted: !!userChallenge,
    isCompleted: userChallenge?.status === USER_CHALLENGE_STATUS.COMPLETED,
  };
};

module.exports = {
  getAllChallenges,
  getChallenge,
  getNearby,
  acceptChallenge,
  completeChallenge,
  getUserChallengesList,
  getUserChallengeProgress,
};


