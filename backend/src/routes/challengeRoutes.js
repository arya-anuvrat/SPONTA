const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges (with optional filters: category, difficulty)
 * @access  Public (optional auth)
 * @query   category, difficulty, page, limit
 */
router.get('/', optionalAuth, challengeController.getAllChallenges);

/**
 * @route   GET /api/challenges/categories
 * @desc    Get all challenge categories
 * @access  Public
 */
router.get('/categories', challengeController.getCategories);

/**
 * @route   GET /api/challenges/nearby
 * @desc    Get nearby challenges
 * @access  Public (optional auth)
 * @query   lat, lng, radius (in meters, default 5000)
 */
router.get('/nearby', optionalAuth, challengeController.getNearbyChallenges);

/**
 * @route   GET /api/challenges/my
 * @desc    Get current user's challenges
 * @access  Private
 * @query   status (optional: accepted, completed, failed)
 */
router.get('/my', authenticateToken, challengeController.getMyChallenges);

/**
 * @route   GET /api/challenges/:id
 * @desc    Get challenge by ID
 * @access  Public (optional auth)
 */
router.get('/:id', optionalAuth, challengeController.getChallengeById);

/**
 * @route   GET /api/challenges/:id/progress
 * @desc    Get user's progress on a challenge
 * @access  Private
 */
router.get('/:id/progress', authenticateToken, challengeController.getChallengeProgress);

/**
 * @route   POST /api/challenges/:id/accept
 * @desc    Accept a challenge
 * @access  Private
 */
router.post('/:id/accept', authenticateToken, challengeController.acceptChallenge);

/**
 * @route   POST /api/challenges/:id/complete
 * @desc    Complete a challenge
 * @access  Private
 * @body    { photoUrl?, location?, verified? }
 */
router.post('/:id/complete', authenticateToken, challengeController.completeChallenge);

module.exports = router;
