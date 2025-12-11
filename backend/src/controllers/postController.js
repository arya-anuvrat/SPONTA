const postModel = require('../models/Post');
const userModel = require('../models/User');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Get all community posts
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    console.log(`📥 Fetching all posts (limit: ${limit})`);
    const posts = await postModel.getAllPosts(limit);
    console.log(`✅ Returning ${posts.length} posts to client`);
    
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('❌ Error in getAllPosts controller:', error);
    next(error);
  }
};

/**
 * Get post by ID
 */
exports.getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await postModel.getPostById(postId);
    
    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new post
 */
exports.createPost = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { caption, imageUrl, isSponsored } = req.body;
    
    if (!caption && !imageUrl) {
      throw new BadRequestError('Post must have either a caption or an image');
    }
    
    // Get user info
    let user;
    try {
      user = await userModel.getUserById(userId);
    } catch (error) {
      throw new NotFoundError('User not found');
    }
    
    const postData = {
      userId,
      username: user.displayName || user.email?.split('@')[0] || 'user',
      userImage: user.profilePicture || null,
      caption: caption || '',
      imageUrl: imageUrl || null,
      isSponsored: isSponsored || false,
    };
    
    const post = await postModel.createPost(postData);
    
    console.log(`✅ Post created successfully:`, {
      postId: post.id,
      userId: post.userId,
      username: post.username,
      caption: post.caption?.substring(0, 50) + '...',
    });
    
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a post (only by owner)
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.uid;
    const { caption, imageUrl } = req.body;
    
    // Check if post exists and user owns it
    const post = await postModel.getPostById(postId);
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }
    
    const updateData = {};
    if (caption !== undefined) updateData.caption = caption;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    const updatedPost = await postModel.updatePost(postId, updateData);
    
    res.json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post (only by owner)
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.uid;
    
    // Check if post exists and user owns it
    const post = await postModel.getPostById(postId);
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }
    
    await postModel.deletePost(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like/unlike a post
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.uid;
    
    const post = await postModel.toggleLike(postId, userId);
    
    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get posts by user ID
 */
exports.getPostsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const posts = await postModel.getPostsByUserId(userId);
    
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

