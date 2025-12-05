/**
 * Challenge Generation Controller
 * Handles AI-generated challenge requests
 */

const challengeGenerationService = require("../services/challengeGenerationService");

/**
 * Generate a single challenge
 * POST /api/challenges/generate
 */
const generateChallenge = async (req, res, next) => {
  try {
    const { category, difficulty } = req.body;
    const userContext = req.user || {}; // User context if authenticated
    const location = req.body.location || null;

    const challenge = await challengeGenerationService.generateAndSaveChallenge({
      category,
      difficulty,
      userContext: {
        displayName: userContext.displayName,
        college: userContext.college,
      },
      location,
    });

    res.status(201).json({
      success: true,
      message: "Challenge generated successfully",
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate multiple challenges
 * POST /api/challenges/generate/batch
 */
const generateMultipleChallenges = async (req, res, next) => {
  try {
    const { count = 5, category, difficulty } = req.body;
    const userContext = req.user || {};
    const location = req.body.location || null;

    if (count > 10) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Cannot generate more than 10 challenges at once",
      });
    }

    const result = await challengeGenerationService.generateMultipleChallenges(count, {
      category,
      difficulty,
      userContext: {
        displayName: userContext.displayName,
        college: userContext.college,
      },
      location,
    });

    res.status(201).json({
      success: true,
      message: `Generated ${result.successCount}/${result.totalRequested} challenges`,
      data: {
        challenges: result.challenges,
        errors: result.errors,
        successCount: result.successCount,
        totalRequested: result.totalRequested,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get challenge generation info (categories, difficulties)
 * GET /api/challenges/generate/info
 */
const getGenerationInfo = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        categories: challengeGenerationService.CHALLENGE_CATEGORIES,
        difficulties: challengeGenerationService.DIFFICULTY_LEVELS,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateChallenge,
  generateMultipleChallenges,
  getGenerationInfo,
};

