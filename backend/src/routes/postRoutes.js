const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/posts
 * @desc    Get all community posts
 * @access  Public (optional auth)
 * @query   limit
 */
router.get('/', optionalAuth, postController.getAllPosts);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get post by ID
 * @access  Public (optional auth)
 */
router.get('/:postId', optionalAuth, postController.getPostById);

/**
 * @route   POST /api/posts
 * @desc    Create a new community post
 * @access  Private
 * @body    { caption, imageUrl?, isSponsored? }
 */
router.post('/', authenticateToken, postController.createPost);

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update a post (only owner)
 * @access  Private
 * @body    { caption?, imageUrl? }
 */
router.put('/:postId', authenticateToken, postController.updatePost);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete a post (only owner)
 * @access  Private
 */
router.delete('/:postId', authenticateToken, postController.deletePost);

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like/unlike a post
 * @access  Private
 */
router.post('/:postId/like', authenticateToken, postController.toggleLike);

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get all posts by a specific user
 * @access  Public (optional auth)
 */
router.get('/user/:userId', optionalAuth, postController.getPostsByUserId);

module.exports = router;

