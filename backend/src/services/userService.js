/**
 * User Service - Business logic for users
 */

const { getUserById, updateUser, getUsersByIds } = require('../models/User');
const { getUserChallenges } = require('../models/UserChallenge');
const { getEvents } = require('../models/Event');
const { validateUserSchema } = require('../models/schemas');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Get user profile
 */
const getUserProfile = async (uid) => {
  return await getUserById(uid);
};

/**
 * Update user profile
 */
const updateUserProfile = async (uid, updateData) => {
  // Validate update data
  const validatedData = validateUserSchema(updateData, true); // isUpdate = true
  
  return await updateUser(uid, validatedData);
};

/**
 * Get user statistics
 */
const getUserStats = async (uid) => {
  const user = await getUserById(uid);
  
  // Get user's challenges
  const allUserChallenges = await getUserChallenges(uid);
  const completedChallenges = allUserChallenges.filter(
    uc => uc.status === 'completed'
  );
  const acceptedChallenges = allUserChallenges.filter(
    uc => uc.status === 'accepted'
  );
  
  // Get events user is participating in
  const allEvents = await getEvents();
  const userEvents = allEvents.filter(
    event => event.participants && event.participants.includes(uid)
  );
  
  // Calculate total points from completed challenges
  const totalPointsFromChallenges = completedChallenges.reduce(
    (sum, uc) => sum + (uc.pointsEarned || 0),
    0
  );
  
  return {
    user: {
      uid: user.uid,
      displayName: user.displayName,
      points: user.points,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    },
    challenges: {
      total: allUserChallenges.length,
      accepted: acceptedChallenges.length,
      completed: completedChallenges.length,
      totalPointsEarned: totalPointsFromChallenges,
    },
    events: {
      total: userEvents.length,
      upcoming: userEvents.filter(e => e.status === 'upcoming').length,
      completed: userEvents.filter(e => e.status === 'completed').length,
    },
    achievements: {
      // Placeholder for future badge system
      badges: [],
      totalBadges: 0,
    },
  };
};

/**
 * Get user's friends list
 */
const getFriends = async (uid) => {
  const user = await getUserById(uid);
  
  if (!user.friends || user.friends.length === 0) {
    return [];
  }
  
  const friends = await getUsersByIds(user.friends);
  
  // Return simplified friend data
  return friends.map(friend => ({
    uid: friend.uid,
    displayName: friend.displayName,
    profilePicture: friend.profilePicture,
    points: friend.points,
    level: friend.level,
    currentStreak: friend.currentStreak,
  }));
};

/**
 * Send friend request
 */
const sendFriendRequest = async (uid, friendUid) => {
  if (uid === friendUid) {
    throw new ConflictError('Cannot send friend request to yourself');
  }
  
  const user = await getUserById(uid);
  const friend = await getUserById(friendUid);
  
  // Check if already friends
  if (user.friends && user.friends.includes(friendUid)) {
    throw new ConflictError('Already friends with this user');
  }
  
  // Check if request already sent
  if (user.friendRequests?.sent && user.friendRequests.sent.includes(friendUid)) {
    throw new ConflictError('Friend request already sent');
  }
  
  // Check if request already received
  if (user.friendRequests?.received && user.friendRequests.received.includes(friendUid)) {
    throw new ConflictError('Friend request already received from this user');
  }
  
  // Add to sent requests
  const updatedSent = [...(user.friendRequests?.sent || []), friendUid];
  await updateUser(uid, {
    friendRequests: {
      ...user.friendRequests,
      sent: updatedSent,
    },
  });
  
  // Add to friend's received requests
  const updatedReceived = [...(friend.friendRequests?.received || []), uid];
  await updateUser(friendUid, {
    friendRequests: {
      ...friend.friendRequests,
      received: updatedReceived,
    },
  });
  
  return { message: 'Friend request sent successfully' };
};

/**
 * Accept friend request
 */
const acceptFriendRequest = async (uid, friendUid) => {
  const user = await getUserById(uid);
  const friend = await getUserById(friendUid);
  
  // Check if request exists
  if (!user.friendRequests?.received || !user.friendRequests.received.includes(friendUid)) {
    throw new NotFoundError('Friend request not found');
  }
  
  // Remove from received requests
  const updatedReceived = user.friendRequests.received.filter(id => id !== friendUid);
  
  // Add to friends list
  const updatedFriends = [...(user.friends || []), friendUid];
  
  await updateUser(uid, {
    friends: updatedFriends,
    friendRequests: {
      ...user.friendRequests,
      received: updatedReceived,
    },
  });
  
  // Remove from friend's sent requests and add to their friends
  const friendUpdatedSent = friend.friendRequests?.sent?.filter(id => id !== uid) || [];
  const friendUpdatedFriends = [...(friend.friends || []), uid];
  
  await updateUser(friendUid, {
    friends: friendUpdatedFriends,
    friendRequests: {
      ...friend.friendRequests,
      sent: friendUpdatedSent,
    },
  });
  
  return { message: 'Friend request accepted' };
};

/**
 * Remove friend
 */
const removeFriend = async (uid, friendUid) => {
  const user = await getUserById(uid);
  
  if (!user.friends || !user.friends.includes(friendUid)) {
    throw new NotFoundError('Friend not found');
  }
  
  // Remove from friends list
  const updatedFriends = user.friends.filter(id => id !== friendUid);
  await updateUser(uid, { friends: updatedFriends });
  
  // Remove from friend's friends list
  const friend = await getUserById(friendUid);
  const friendUpdatedFriends = friend.friends?.filter(id => id !== uid) || [];
  await updateUser(friendUid, { friends: friendUpdatedFriends });
  
  return { message: 'Friend removed successfully' };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
};

