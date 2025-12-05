/**
 * Notification Model - Firestore operations for notifications collection
 */

const { db, admin } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');

const COLLECTION_NAME = 'notifications';

/**
 * Create a new notification
 */
const createNotification = async (notificationData) => {
  const notificationDoc = {
    ...notificationData,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(notificationDoc);
  return { id: docRef.id, ...notificationDoc };
};

/**
 * Get notification by ID
 */
const getNotificationById = async (notificationId) => {
  const notificationDoc = await db.collection(COLLECTION_NAME).doc(notificationId).get();

  if (!notificationDoc.exists) {
    throw new NotFoundError('Notification');
  }

  return { id: notificationDoc.id, ...notificationDoc.data() };
};

/**
 * Get user's notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  const { limit = 50, unreadOnly = false } = options;

  let query = db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc');

  if (unreadOnly) {
    query = query.where('read', '==', false);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  await db.collection(COLLECTION_NAME).doc(notificationId).update({
    read: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Mark all user notifications as read
 */
const markAllAsRead = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  return snapshot.size;
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId) => {
  await db.collection(COLLECTION_NAME).doc(notificationId).delete();
};

/**
 * Delete all read notifications for a user
 */
const deleteReadNotifications = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .where('read', '==', true)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return snapshot.size;
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();

  return snapshot.size;
};

module.exports = {
  createNotification,
  getNotificationById,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadCount,
};

