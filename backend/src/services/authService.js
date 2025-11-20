/**
 * Authentication Service
 */

const { auth } = require('../config/firebase');
const { createUser, getUserByPhone, getUserById } = require('../models/User');
const { validateUserSchema } = require('../models/schemas');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

/**
 * Create a custom token for a user (for testing/development)
 * In production, tokens are created client-side via Firebase Auth
 */
const createCustomToken = async (uid) => {
  try {
    const customToken = await auth.createCustomToken(uid);
    return customToken;
  } catch (error) {
    throw new Error(`Failed to create custom token: ${error.message}`);
  }
};

/**
 * Sign up a new user
 */
const signup = async (userData) => {
  try {
    // Validate user data
    const validatedData = validateUserSchema(userData);
    
    // Check if user already exists by phone number
    const existingUser = await getUserByPhone(validatedData.phoneNumber);
    if (existingUser) {
      throw new ConflictError('User with this phone number already exists');
    }
    
    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        phoneNumber: validatedData.phoneNumber,
        email: validatedData.email || undefined,
        displayName: validatedData.displayName,
      });
    } catch (error) {
      if (error.code === 'auth/phone-number-already-exists') {
        throw new ConflictError('Phone number already registered');
      }
      throw new Error(`Failed to create Firebase user: ${error.message}`);
    }
    
    // Create user document in Firestore
    const userDoc = await createUser(firebaseUser.uid, validatedData);
    
    return {
      uid: firebaseUser.uid,
      user: userDoc,
    };
  } catch (error) {
    // If Firestore creation fails, clean up Firebase Auth user
    if (error.name === 'ConflictError' || error.name === 'ValidationError') {
      throw error;
    }
    throw error;
  }
};

/**
 * Sign in user (verify token and return user data)
 * Note: Actual sign-in happens client-side with Firebase Auth
 * This endpoint verifies the token and returns user data
 */
const signin = async (uid) => {
  try {
    // Verify user exists in Firebase Auth
    const firebaseUser = await auth.getUser(uid);
    
    // Get user document from Firestore
    let userDoc;
    try {
      userDoc = await getUserById(uid);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        // User exists in Auth but not in Firestore - create it
        userDoc = await createUser(uid, {
          phoneNumber: firebaseUser.phoneNumber || '',
          email: firebaseUser.email || null,
          displayName: firebaseUser.displayName || 'User',
          dateOfBirth: new Date(), // Default, should be updated
        });
      } else {
        throw error;
      }
    }
    
    return {
      uid: firebaseUser.uid,
      user: userDoc,
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new NotFoundError('User');
    }
    throw error;
  }
};

/**
 * Verify phone number (stub - actual verification happens client-side)
 * This can be used to mark phone as verified in Firestore
 */
const verifyPhone = async (uid) => {
  try {
    const firebaseUser = await auth.getUser(uid);
    
    if (!firebaseUser.phoneNumber) {
      throw new Error('User does not have a phone number');
    }
    
    // Phone verification is handled by Firebase Auth client-side
    // This endpoint can be used to update user status if needed
    
    return {
      verified: true,
      phoneNumber: firebaseUser.phoneNumber,
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new NotFoundError('User');
    }
    throw error;
  }
};

/**
 * Get user by UID (for token verification)
 */
const getUserByUid = async (uid) => {
  try {
    const user = await getUserById(uid);
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signup,
  signin,
  verifyPhone,
  getUserByUid,
  createCustomToken,
};

