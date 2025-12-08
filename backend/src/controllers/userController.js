/**
 * User Controller
 */

const userService = require('../services/userService');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const profile = await userService.getUserProfile(uid);
    
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const updateData = req.body;
    
    const updatedProfile = await userService.updateUserProfile(uid, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 * GET /api/users/stats
 */
const getStats = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const stats = await userService.getUserStats(uid);
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's friends
 * GET /api/users/friends
 */
const getFriends = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const friends = await userService.getFriends(uid);
    
    res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send friend request
 * POST /api/users/friends/request
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { friendUid } = req.body;
    
    if (!friendUid) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'friendUid is required',
      });
    }
    
    const result = await userService.sendFriendRequest(uid, friendUid);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept friend request
 * POST /api/users/friends/accept/:friendUid
 */
const acceptFriendRequest = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { friendUid } = req.params;
    
    const result = await userService.acceptFriendRequest(uid, friendUid);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove friend
 * DELETE /api/users/friends/:friendUid
 */
const removeFriend = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { friendUid } = req.params;
    
    const result = await userService.removeFriend(uid, friendUid);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
};

