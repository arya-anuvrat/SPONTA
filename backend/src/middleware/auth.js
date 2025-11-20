/**
 * Authentication Middleware
 */

const { auth } = require('../config/firebase');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Verify Firebase ID token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    // Verify the token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number,
    };
    
    next();
  } catch (error) {
    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    }
    
    // Firebase auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token revoked',
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      if (token) {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          phoneNumber: decodedToken.phone_number,
        };
      }
    }
    
    next();
  } catch (error) {
    // If optional auth fails, just continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
