/**
 * Authentication Controller
 */

const authService = require('../services/authService');
const { AppError } = require('../utils/errors');

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { phoneNumber, email, displayName, dateOfBirth, location, college } = req.body;
    
    const result = await authService.signup({
      phoneNumber,
      email,
      displayName,
      dateOfBirth,
      location,
      college,
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in user
 * POST /api/auth/signin
 * Note: Client should send Firebase ID token in Authorization header
 */
const signin = async (req, res, next) => {
  try {
    // User is already authenticated via middleware
    const { uid } = req.user;
    
    const result = await authService.signin(uid);
    
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone number
 * POST /api/auth/verify-phone
 */
const verifyPhone = async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    const result = await authService.verifyPhone(uid);
    
    res.status(200).json({
      success: true,
      message: 'Phone verification successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    const user = await authService.getUserByUid(uid);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token (stub - Firebase handles token refresh client-side)
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    // Firebase handles token refresh on the client side
    // This endpoint can be used for custom token refresh logic if needed
    
    res.status(200).json({
      success: true,
      message: 'Token refresh should be handled client-side with Firebase',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  verifyPhone,
  getMe,
  refreshToken,
};

