/**
 * Streak Service - Business logic for streak tracking
 */

const { getUserById, updateUserStreak } = require('../models/User');
const { getUserChallenges } = require('../models/UserChallenge');
const { getChallengeById } = require('../models/Challenge');
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
  
  // Helper to check if a challenge is a daily challenge
  const isDailyChallenge = async (challengeId) => {
    try {
      const challenge = await getChallengeById(challengeId);
      return challenge.isDaily === true;
    } catch (error) {
      // If challenge not found, assume it's not a daily challenge
      return false;
    }
  };

  // Check if user completed something today (only daily challenges count for streak)
  const completedTodayChecks = await Promise.all(
    userChallenges.map(async (uc) => {
      if (!uc.completedAt) return false;
      // Only count verified completions for streak
      if (uc.verified !== true) return false;
      // Only count daily challenges for streak
      const isDaily = await isDailyChallenge(uc.challengeId);
      if (!isDaily) return false;
      const completedDate = toDate(uc.completedAt);
      if (!completedDate) return false;
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    })
  );
  const completedToday = completedTodayChecks.some(check => check === true);
  
  // Check if user completed something yesterday (only daily challenges count for streak)
  const completedYesterdayChecks = await Promise.all(
    userChallenges.map(async (uc) => {
      if (!uc.completedAt) return false;
      // Only count verified completions for streak
      if (uc.verified !== true) return false;
      // Only count daily challenges for streak
      const isDaily = await isDailyChallenge(uc.challengeId);
      if (!isDaily) return false;
      const completedDate = toDate(uc.completedAt);
      if (!completedDate) return false;
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === yesterday.getTime();
    })
  );
  const completedYesterday = completedYesterdayChecks.some(check => check === true);
  
  // Initialize streak - start at 0, only increment if daily challenges are completed
  let currentStreak = 0;
  let longestStreak = user.longestStreak || 0;
  let lastActivityDate = user.lastActivityDate;
  
  if (completedToday) {
    // User completed a daily challenge today
    if (completedYesterday) {
      // Continue streak (completed yesterday too)
      // Get the previous streak and increment it
      const previousStreak = user.currentStreak || 0;
      currentStreak = previousStreak + 1;
    } else {
      // Start new streak (first completion or streak was broken)
      currentStreak = 1;
    }
    lastActivityDate = today;
  } else {
    // User didn't complete anything today
    if (!completedYesterday) {
      // No completion today or yesterday - streak is 0
      currentStreak = 0;
    } else {
      // Completed yesterday but not today - keep streak for now
      // (will be reset tomorrow if they don't complete)
      // But only if they actually had a valid streak
      const previousStreak = user.currentStreak || 0;
      currentStreak = previousStreak > 0 ? previousStreak : 0;
    }
  }
  
  // Ensure streak is 0 if user has never completed a daily challenge
  // Check if lastActivityDate exists and is valid
  if (!lastActivityDate && currentStreak > 0) {
    currentStreak = 0;
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

