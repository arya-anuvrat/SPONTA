/**
 * Challenge Controller
 */

const challengeService = require('../services/challengeService');
const challengeGenerationService = require('../services/challengeGenerationService');
const { validatePagination } = require('../utils/validators');
const { getUserById } = require('../models/User');

/**
 * Get all challenges
 * GET /api/challenges
 */
const getAllChallenges = async (req, res, next) => {
  try {
    const { category, difficulty, page, limit } = req.query;
    
    // Validate pagination
    const pagination = validatePagination(page, limit);
    
    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    
    const challenges = await challengeService.getAllChallenges(filters);
    
    // Simple pagination (for production, implement proper pagination with Firestore)
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedChallenges = challenges.slice(start, end);
    
    res.status(200).json({
      success: true,
      data: paginatedChallenges,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: challenges.length,
        totalPages: Math.ceil(challenges.length / pagination.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get challenge by ID
 * GET /api/challenges/:id
 */
const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 getChallengeById called with id: ${id}`);
    
    // Prevent reserved route names from being treated as IDs
    const reservedRoutes = ['daily', 'my', 'nearby', 'categories', 'generate'];
    if (reservedRoutes.includes(id)) {
      console.error(`❌ ERROR: Reserved route "${id}" was matched by /:id route instead of its specific route!`);
      return res.status(404).json({
        success: false,
        message: `Route /${id} is a reserved endpoint. Use the correct endpoint path.`,
      });
    }
    
    const challenge = await challengeService.getChallenge(id);
    
    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby challenges
 * GET /api/challenges/nearby
 */
const getNearbyChallenges = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Latitude and longitude are required',
      });
    }
    
    const challenges = await challengeService.getNearby(lat, lng, radius);
    
    res.status(200).json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a challenge
 * POST /api/challenges/:id/accept
 */
const acceptChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const result = await challengeService.acceptChallenge(uid, id);
    
    res.status(200).json({
      success: true,
      message: 'Challenge accepted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a challenge
 * POST /api/challenges/:id/complete
 */
const completeChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { photoUrl, location, verified } = req.body;
    
    const result = await challengeService.completeChallenge(uid, id, {
      photoUrl,
      location,
      verified: verified || false,
    });
    
    res.status(200).json({
      success: true,
      message: 'Challenge completed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's challenges
 * GET /api/challenges/my
 */
const getMyChallenges = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { status } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    
    const challenges = await challengeService.getUserChallengesList(uid, filters);
    
    res.status(200).json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's progress on a challenge
 * GET /api/challenges/:id/progress
 */
const getChallengeProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const progress = await challengeService.getUserChallengeProgress(uid, id);
    
    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get challenge categories
 * GET /api/challenges/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { CHALLENGE_CATEGORIES } = require('../utils/constants');
    
    res.status(200).json({
      success: true,
      data: CHALLENGE_CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's daily challenge (cached per day, based on user preferences and location)
 * GET /api/challenges/daily
 */
const getDailyChallenge = async (req, res, next) => {
  console.log('✅ getDailyChallenge called - this is the correct route handler');
  try {
    const { uid } = req.user || {};
    
    if (!uid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User authentication required',
      });
    }
    
    // Get user's timezone and forceRegenerate from query parameters
    const userTimezone = req.query.timezone || 'UTC';
    const forceRegenerate = req.query.forceRegenerate || 'false';
    // Allow category to be passed as query parameter for testing
    const categoryFromQuery = req.query.category || null;
    
    // Fetch full user profile to get preferences and location
    let userProfile = null;
    try {
      userProfile = await getUserById(uid);
    } catch (error) {
      console.warn('Could not fetch user profile:', error);
    }
    
    // Get user location from profile
    let location = null;
    if (userProfile?.location) {
      const locationStr = userProfile.location;
      if (typeof locationStr === 'string' && locationStr.includes(',')) {
        const [lat, lng] = locationStr.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          location = { latitude: lat, longitude: lng };
        }
      }
    }
    
    // Get user preferences (categories, difficulty) from profile
    // User can select multiple categories, we'll pick one randomly or use first one
    // But if category is passed as query parameter, use that instead (for testing)
    // Also prioritize "test" category if it's in the user's preferences (for testing)
    const preferredCategories = userProfile?.preferredCategories || [];
    let category = categoryFromQuery;
    if (!category && preferredCategories.length > 0) {
      // If "test" is in preferences, prioritize it for testing
      if (preferredCategories.includes('test')) {
        category = 'test';
        console.log('🧪 TEST category found in preferences, using it for daily challenge');
      } else {
        category = preferredCategories[Math.floor(Math.random() * preferredCategories.length)];
      }
    }
    const difficulty = userProfile?.preferredDifficulty || null;
    
    // Generate daily challenge using AI (service handles caching per day)
    console.log(`📅 Getting daily challenge for user ${uid}, timezone: ${userTimezone}, forceRegenerate: ${forceRegenerate}`);
    
    let challenge;
    try {
      challenge = await challengeGenerationService.getOrGenerateDailyChallenge({
        userId: uid,
        category,
        difficulty,
        location,
        timezone: userTimezone,
        forceRegenerate: forceRegenerate === 'true', // Convert string to boolean
        userContext: {
          displayName: userProfile?.displayName || req.user?.displayName,
          college: userProfile?.college || req.user?.college,
        },
      });
    } catch (genError) {
      console.error(`❌ Error generating daily challenge for user ${uid}:`, genError);
      console.error(`❌ Error stack:`, genError.stack);
      return res.status(500).json({
        success: false,
        message: genError.message || "Failed to generate daily challenge. Please try again.",
      });
    }
    
    if (!challenge) {
      console.error(`❌ Challenge is null for user ${uid}`);
      return res.status(500).json({
        success: false,
        message: "Failed to generate daily challenge. Please try again.",
      });
    }

    console.log(`✅ Returning daily challenge for user ${uid}:`, challenge.id);
    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('❌ Unexpected error in getDailyChallenge:', error);
    console.error('❌ Error stack:', error.stack);
    // If challenge generation fails, return a helpful error
    if (error.message && (error.message.includes('Failed to generate') || error.message.includes('Challenge'))) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to generate daily challenge. Please try again.",
      });
    }
    next(error);
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  getNearbyChallenges,
  acceptChallenge,
  completeChallenge,
  getMyChallenges,
  getChallengeProgress,
  getCategories,
  getDailyChallenge,
};

