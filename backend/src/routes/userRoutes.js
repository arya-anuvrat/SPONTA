const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', authenticateToken, userController.updateProfile);

/**
 * @route   GET /api/users/stats
 * @desc    Get current user's statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, userController.getStats);

/**
 * @route   GET /api/users/friends
 * @desc    Get current user's friends list
 * @access  Private
 */
router.get('/friends', authenticateToken, userController.getFriends);

/**
 * @route   POST /api/users/friends/request
 * @desc    Send a friend request
 * @access  Private
 * @body    { friendUid: string }
 */
router.post('/friends/request', authenticateToken, userController.sendFriendRequest);

/**
 * @route   POST /api/users/friends/accept/:friendUid
 * @desc    Accept a friend request
 * @access  Private
 */
router.post('/friends/accept/:friendUid', authenticateToken, userController.acceptFriendRequest);

/**
 * @route   DELETE /api/users/friends/:friendUid
 * @desc    Remove a friend
 * @access  Private
 */
router.delete('/friends/:friendUid', authenticateToken, userController.removeFriend);

module.exports = router;
