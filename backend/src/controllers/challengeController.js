/**
 * Challenge Controller
 */

const challengeService = require('../services/challengeService');
const { validatePagination } = require('../utils/validators');

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

module.exports = {
  getAllChallenges,
  getChallengeById,
  getNearbyChallenges,
  acceptChallenge,
  completeChallenge,
  getMyChallenges,
  getChallengeProgress,
  getCategories,
};

