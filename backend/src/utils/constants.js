/**
 * Application Constants
 */

// User Roles
exports.USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Challenge Status
exports.CHALLENGE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
};

// User Challenge Status
exports.USER_CHALLENGE_STATUS = {
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Event Status
exports.EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Challenge Categories
exports.CHALLENGE_CATEGORIES = [
  'adventure',
  'social',
  'creative',
  'fitness',
  'academic',
  'wellness',
  'exploration',
];

// Challenge Difficulty
exports.CHALLENGE_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Challenge Frequency
exports.CHALLENGE_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ONE_TIME: 'one-time',
};

// Reaction Types
exports.REACTION_TYPES = {
  LIKE: 'like',
  FIRE: 'fire',
  WOW: 'wow',
  SUPPORT: 'support',
};

// Notification Types
exports.NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  CHALLENGE_COMPLETE: 'challenge_complete',
  EVENT_REMINDER: 'event_reminder',
  STREAK_MILESTONE: 'streak_milestone',
  BADGE_EARNED: 'badge_earned',
};

// Leaderboard Types
exports.LEADERBOARD_TYPES = {
  GLOBAL: 'global',
  COLLEGE: 'college',
  FRIENDS: 'friends',
};

// Leaderboard Periods
exports.LEADERBOARD_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALL_TIME: 'all-time',
};

// Points Configuration
exports.POINTS = {
  CHALLENGE_COMPLETE: 10,
  EVENT_ATTEND: 15,
  STREAK_BONUS: 5, // Per day of streak
  BADGE_EARNED: 25,
};

// Default Values
exports.DEFAULTS = {
  USER_LEVEL: 1,
  USER_POINTS: 0,
  STREAK_COUNT: 0,
  MAX_FRIEND_REQUESTS: 50,
};

// Error Messages
exports.ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  EVENT_NOT_FOUND: 'Event not found',
};

// Success Messages
exports.SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  CHALLENGE_ACCEPTED: 'Challenge accepted successfully',
  CHALLENGE_COMPLETED: 'Challenge completed successfully',
  EVENT_CREATED: 'Event created successfully',
  EVENT_JOINED: 'Successfully joined event',
};

