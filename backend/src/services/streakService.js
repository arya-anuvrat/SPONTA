/**
 * Streak Service - Business logic for streak tracking
 */

const { getUserById, updateUserStreak } = require('../models/User');
const { getUserChallenges } = require('../models/UserChallenge');
const { USER_CHALLENGE_STATUS } = require('../utils/constants');
const { checkStreakNotifications } = require('./notificationService');

/**
 * Calculate and update user streak
 * Also sends notifications for streak milestones
 */
const updateStreak = async (uid) => {
  const user = await getUserById(uid);
  
  // Get user's completed challenges
  const userChallenges = await getUserChallenges(uid, {
    status: USER_CHALLENGE_STATUS.COMPLETED,
  });
  
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Helper to convert Firestore timestamp to Date
  const toDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000);
    return new Date(timestamp);
  };
  
  // Check if user completed something today (only verified completions count for streak)
  const completedToday = userChallenges.some(uc => {
    if (!uc.completedAt) return false;
    // Only count verified completions for streak
    if (uc.verified !== true) return false;
    const completedDate = toDate(uc.completedAt);
    if (!completedDate) return false;
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
  
  // Check if user completed something yesterday (only verified completions count for streak)
  const completedYesterday = userChallenges.some(uc => {
    if (!uc.completedAt) return false;
    // Only count verified completions for streak
    if (uc.verified !== true) return false;
    const completedDate = toDate(uc.completedAt);
    if (!completedDate) return false;
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === yesterday.getTime();
  });
  
  let currentStreak = user.currentStreak || 0;
  let longestStreak = user.longestStreak || 0;
  let lastActivityDate = user.lastActivityDate;
  
  if (completedToday) {
    // User completed something today
    if (completedYesterday || currentStreak === 0) {
      // Continue streak (completed yesterday) or start new streak
      currentStreak = completedYesterday ? currentStreak + 1 : 1;
    } else {
      // Streak was broken, start new streak
      currentStreak = 1;
    }
    lastActivityDate = today;
  } else {
    // User didn't complete anything today
    if (!completedYesterday && currentStreak > 0) {
      // Streak broken (didn't complete yesterday either)
      currentStreak = 0;
    }
    // If completed yesterday but not today, keep current streak for now
    // (will be reset tomorrow if they don't complete)
  }
  
  // Update longest streak if current is higher
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
  
  // Update user streak
  await updateUserStreak(uid, {
    currentStreak,
    longestStreak,
    lastActivityDate,
  });
  
  // Send streak notifications (milestones, reminders, etc.)
  // Only send if streak changed or milestone reached
  if (completedToday && (currentStreak > (user.currentStreak || 0))) {
    try {
      await checkStreakNotifications(uid);
    } catch (error) {
      console.error('Error sending streak notifications:', error);
      // Don't fail streak update if notification fails
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
    completedToday,
  };
};

/**
 * Get user's streak information
 */
const getStreakInfo = async (uid) => {
  const user = await getUserById(uid);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Helper to convert Firestore timestamp to Date
  const toDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000);
    return new Date(timestamp);
  };
  
  const lastActivity = toDate(user.lastActivityDate);
  
  const isActiveToday = lastActivity && lastActivity.getTime() === today.getTime();
  
  return {
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    lastActivityDate: lastActivity,
    isActiveToday,
  };
};

module.exports = {
  updateStreak,
  getStreakInfo,
};

