const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', authController.signup);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user (requires Firebase ID token)
 * @access  Private
 */
router.post('/signin', authenticateToken, authController.signin);

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone number
 * @access  Private
 */
router.post('/verify-phone', authenticateToken, authController.verifyPhone);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh authentication token
 * @access  Private
 */
router.post('/refresh-token', authenticateToken, authController.refreshToken);

module.exports = router;
