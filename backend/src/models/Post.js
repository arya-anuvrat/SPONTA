/**
 * Post Model - Firestore operations for community posts collection
 */

const { db, admin } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');

const COLLECTION_NAME = 'communityPosts';

/**
 * Create a new community post
 */
const createPost = async (postData) => {
  const postDoc = {
    userId: postData.userId,
    username: postData.username,
    userImage: postData.userImage || null,
    imageUrl: postData.imageUrl || null,
    caption: postData.caption || '',
    likes: 0,
    likedBy: [],
    isSponsored: postData.isSponsored || false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  const docRef = await db.collection(COLLECTION_NAME).add(postDoc);
  console.log(`✅ Created post with ID: ${docRef.id} in collection '${COLLECTION_NAME}'`);
  
  // Fetch the created document to return it with the actual timestamp
  const createdDoc = await docRef.get();
  const data = createdDoc.data();
  return {
    id: createdDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
};

/**
 * Get post by ID
 */
const getPostById = async (postId) => {
  const postDoc = await db.collection(COLLECTION_NAME).doc(postId).get();
  
  if (!postDoc.exists) {
    throw new NotFoundError('Post');
  }
  
  const data = postDoc.data();
  // Convert Firestore timestamps to ISO strings for JSON response
  return {
    id: postDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
  };
};

/**
 * Get all posts (ordered by most recent first)
 */
const getAllPosts = async (limit = 50) => {
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
      };
    });
    
    console.log(`📦 Retrieved ${posts.length} posts from Firestore collection '${COLLECTION_NAME}'`);
    return posts;
  } catch (error) {
    console.error(`❌ Error fetching posts from Firestore:`, error);
    // If orderBy fails (e.g., missing index), try without ordering
    if (error.code === 'failed-precondition') {
      console.warn('⚠️ Firestore index missing for orderBy. Fetching without ordering...');
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .limit(limit)
        .get();
      
      const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        };
      });
      
      // Sort client-side as fallback
      posts.sort((a, b) => {
        const aTime = new Date(a.createdAt || a.timestamp || 0).getTime();
        const bTime = new Date(b.createdAt || b.timestamp || 0).getTime();
        return bTime - aTime;
      });
      
      return posts;
    }
    throw error;
  }
};

/**
 * Get posts by user ID
 */
const getPostsByUserId = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    };
  });
};

/**
 * Update post
 */
const updatePost = async (postId, updateData) => {
  const updateDoc = {
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection(COLLECTION_NAME).doc(postId).update(updateDoc);
  console.log(`✅ Updated post ${postId} in collection '${COLLECTION_NAME}'`);
  return getPostById(postId);
};

/**
 * Delete post
 */
const deletePost = async (postId) => {
  await db.collection(COLLECTION_NAME).doc(postId).delete();
  return { success: true };
};

/**
 * Like/unlike a post
 */
const toggleLike = async (postId, userId) => {
  const postRef = db.collection(COLLECTION_NAME).doc(postId);
  const postDoc = await postRef.get();
  
  if (!postDoc.exists) {
    throw new NotFoundError('Post');
  }
  
  const postData = postDoc.data();
  const likedBy = postData.likedBy || [];
  const isLiked = likedBy.includes(userId);
  
  if (isLiked) {
    // Unlike
    await postRef.update({
      likedBy: admin.firestore.FieldValue.arrayRemove(userId),
      likes: admin.firestore.FieldValue.increment(-1),
      updatedAt: new Date(),
    });
  } else {
    // Like
    await postRef.update({
      likedBy: admin.firestore.FieldValue.arrayUnion(userId),
      likes: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });
  }
  
  return getPostById(postId);
};

module.exports = {
  createPost,
  getPostById,
  getAllPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
  toggleLike,
};

