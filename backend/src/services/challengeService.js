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
 * Accept a challenge (idempotent - can be called multiple times safely)
 */
const acceptChallenge = async (userId, challengeId) => {
  // Check if challenge exists
  const challenge = await getChallengeById(challengeId);
  
  // Check if user already accepted this challenge
  const existingUserChallenge = await getUserChallenge(userId, challengeId);
  if (existingUserChallenge) {
    // Challenge already accepted - return existing relationship (idempotent)
    return {
      userChallenge: existingUserChallenge,
      challenge,
      alreadyAccepted: true,
    };
  }
  
  // Create user-challenge relationship
  // Preserve countsForStreak flag from challenge so streak service can check it
  const userChallenge = await createUserChallenge({
    userId,
    challengeId,
    status: USER_CHALLENGE_STATUS.ACCEPTED,
    countsForStreak: challenge.countsForStreak !== false, // Default to true unless explicitly false
  });
  
  // Increment challenge accept count
  await incrementAcceptCount(challengeId);
  
  return {
    userChallenge,
    challenge,
    alreadyAccepted: false,
  };
};

/**
 * Complete a challenge
 */
const completeChallenge = async (userId, challengeId, completionData) => {
  // Get user challenge relationship first (this validates the user has accepted it)
  const userChallenge = await getUserChallenge(userId, challengeId);
  if (!userChallenge) {
    throw new NotFoundError('Challenge not accepted. Please accept the challenge first.');
  }

  if (userChallenge.status === USER_CHALLENGE_STATUS.COMPLETED && userChallenge.verified === true) {
    throw new ConflictError('Challenge already completed');
  }

  // Try to get challenge details, but handle gracefully if it doesn't exist
  // (this can happen with daily challenges or deleted challenges)
  let challenge;
  try {
    challenge = await getChallengeById(challengeId);
  } catch (error) {
    // Challenge not found - use userChallenge data or create minimal challenge object
    console.warn(`Challenge ${challengeId} not found in challenges collection, using userChallenge data`);
    challenge = {
      id: challengeId,
      title: userChallenge.title || userChallenge.challenge?.title || 'Challenge',
      description: userChallenge.description || userChallenge.challenge?.description || '',
      points: userChallenge.challenge?.points || POINTS.CHALLENGE_COMPLETE,
      difficulty: userChallenge.difficulty || userChallenge.challenge?.difficulty || 'medium',
      category: userChallenge.category || userChallenge.challenge?.category || 'general',
    };
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
  // Ensure verified is a boolean (strict check)
  const isVerified = aiResult.verified === true;
  
  console.log('🔍 Challenge completion debug:', {
    challengeId,
    userId,
    aiResultVerified: aiResult.verified,
    aiResultVerifiedType: typeof aiResult.verified,
    isVerified,
    aiConfidence: aiResult.confidence,
  });
  
  const completed = await completeUserChallenge(userChallenge.id, {
    photoUrl: photoUrl || null,
    location: location || null,
    verified: isVerified, // Ensure boolean true, not truthy value
    verifiedBy: "AI",
    aiConfidence: aiResult.confidence,
    aiReasoning: aiResult.reasoning,
    pointsEarned,
  });
  
  console.log('✅ Challenge completed:', {
    userChallengeId: completed.id,
    status: completed.status,
    verified: completed.verified,
    verifiedType: typeof completed.verified,
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
 * Get user's challenges with populated challenge details
 */
const getUserChallengesList = async (userId, filters = {}) => {
  const userChallenges = await getUserChallenges(userId, filters);
  
  // Populate challenge details for each user challenge
  const populatedChallenges = await Promise.all(
    userChallenges.map(async (userChallenge) => {
      try {
        const challenge = await getChallengeById(userChallenge.challengeId);
        return {
          ...userChallenge,
          challenge, // Include full challenge details
          title: challenge.title || challenge.description,
          difficulty: challenge.difficulty,
          category: challenge.category,
          categories: challenge.categories || (challenge.category ? [challenge.category] : []),
        };
      } catch (error) {
        console.error(`Error fetching challenge ${userChallenge.challengeId}:`, error);
        // Return userChallenge without challenge details if fetch fails
        return userChallenge;
      }
    })
  );
  
  return populatedChallenges;
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


