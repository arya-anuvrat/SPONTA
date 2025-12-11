/**
 * Sponta AI - Challenge Generation Service
 * Hybrid approach: Custom templates + AI enhancement
 * This is "our" challenge generation system, not just a Gemini wrapper
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createChallenge } = require("../models/Challenge");
const { validateChallengeSchema } = require("../models/schemas");
const {
  generateFromTemplate,
  CHALLENGE_TEMPLATES,
  DIFFICULTY_MULTIPLIERS,
} = require("./challengeTemplates");
const { db, admin } = require("../config/firebase");

// Gemini client (only if API key is set)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Challenge categories and their characteristics
const CHALLENGE_CATEGORIES = {
  adventure: {
    description: "Outdoor activities, exploration, trying new places",
    examples: ["hiking", "exploring", "traveling", "outdoor activities"],
  },
  social: {
    description: "Meeting people, conversations, group activities",
    examples: ["talking to strangers", "making friends", "group events"],
  },
  creative: {
    description: "Art, music, writing, creative expression",
    examples: ["drawing", "writing", "music", "crafts"],
  },
  fitness: {
    description: "Exercise, sports, physical activities",
    examples: ["running", "gym", "sports", "yoga"],
  },
  academic: {
    description: "Learning, studying, intellectual growth",
    examples: ["learning new skills", "reading", "courses", "research"],
  },
  wellness: {
    description: "Mental health, meditation, self-care",
    examples: ["meditation", "self-care", "mindfulness", "relaxation"],
  },
  exploration: {
    description: "Discovering new places, trying new things",
    examples: ["new restaurants", "new neighborhoods", "new experiences"],
  },
  test: {
    description: "Test category for streak testing - generates drink water challenge",
    examples: ["drink water"],
  },
};

// Difficulty levels and their characteristics
const DIFFICULTY_LEVELS = {
  easy: {
    description: "Quick, simple activities that take 15-30 minutes",
    points: 10,
    duration: 30,
  },
  medium: {
    description: "Moderate activities that take 30-60 minutes or require some effort",
    points: 20,
    duration: 60,
  },
  hard: {
    description: "Challenging activities that take 1+ hours or significant effort",
    points: 30,
    duration: 120,
  },
};

/**
 * Generate a random challenge using Hybrid approach (Templates + AI)
 * This is "our" system - custom templates enhanced with AI
 * 
 * @param {Object} options - Generation options
 * @param {string} options.category - Challenge category (optional, random if not provided)
 * @param {string} options.difficulty - Difficulty level (optional, random if not provided)
 * @param {Object} options.userContext - User context for personalization (optional)
 * @param {Object} options.location - User location for location-based challenges (optional)
 * @returns {Object} Generated challenge object
 */
async function generateChallenge(options = {}) {
  const {
    category,
    difficulty,
    customDescription,
    peopleCount,
    userContext = {},
    location = null,
  } = options;

  // Select random category if not provided
  const selectedCategory =
    category ||
    Object.keys(CHALLENGE_CATEGORIES)[
      Math.floor(Math.random() * Object.keys(CHALLENGE_CATEGORIES).length)
    ];

  // Select random difficulty if not provided
  const selectedDifficulty =
    difficulty ||
    Object.keys(DIFFICULTY_LEVELS)[
      Math.floor(Math.random() * Object.keys(DIFFICULTY_LEVELS).length)
    ];

    // Use our hybrid template system
    try {
      const challengeData = await generateFromTemplate(
        selectedCategory,
        selectedDifficulty,
        userContext,
        location,
        customDescription,
        peopleCount
      );

      // Add metadata
      challengeData.isActive = true;
      challengeData.isFeatured = false;
      // For daily challenges, they should count for streak
      // For regular AI-generated challenges (Sponta AI), they don't count
      if (options.isDaily) {
        challengeData.isDaily = true;
        challengeData.countsForStreak = true; // Daily challenges count for streaks
      } else {
        challengeData.countsForStreak = false; // AI-generated challenges don't count for streaks
      }

    // Validate the challenge data
    try {
      validateChallengeSchema(challengeData);
    } catch (validationError) {
      console.warn("Generated challenge failed validation, using defaults:", validationError.message);
      challengeData.category = selectedCategory;
      challengeData.difficulty = selectedDifficulty;
    }

    return challengeData;
  } catch (error) {
    console.error("Error generating challenge with hybrid system:", error);
    throw new Error(`Failed to generate challenge: ${error.message}`);
  }
}

/**
 * Generate and save a challenge to the database
 * 
 * @param {Object} options - Generation options
 * @returns {Object} Created challenge document
 */
async function generateAndSaveChallenge(options = {}) {
  try {
    console.log('🔄 Starting challenge generation...', { category: options.category, difficulty: options.difficulty });
    
    // Generate challenge using AI
    const challengeData = await generateChallenge(options);
    
    if (!challengeData) {
      throw new Error("Challenge generation returned null or undefined");
    }
    
    console.log('✅ Challenge generated, saving to database...');

    // Save to database
    const challenge = await createChallenge(challengeData);
    
    if (!challenge || !challenge.id) {
      throw new Error("Failed to save challenge to database");
    }
    
    console.log('✅ Challenge saved successfully:', challenge.id);
    return challenge;
  } catch (error) {
    console.error("❌ Error generating and saving challenge:", error);
    console.error("❌ Error stack:", error.stack);
    // Re-throw with more context
    throw new Error(`Failed to generate challenge: ${error.message}`);
  }
}

/**
 * Generate multiple challenges at once
 * 
 * @param {number} count - Number of challenges to generate
 * @param {Object} options - Generation options
 * @returns {Array} Array of created challenge documents
 */
async function generateMultipleChallenges(count = 5, options = {}) {
  const challenges = [];
  const errors = [];

  for (let i = 0; i < count; i++) {
    try {
      const challenge = await generateAndSaveChallenge(options);
      challenges.push(challenge);
      
      // Small delay to avoid rate limiting
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (error) {
      errors.push({ index: i, error: error.message });
      console.error(`Failed to generate challenge ${i + 1}:`, error.message);
    }
  }

  return {
    challenges,
    errors,
    successCount: challenges.length,
    totalRequested: count,
  };
}

/**
 * Get or generate today's daily challenge for a user
 * Caches the challenge per day based on user preferences and location
 * 
 * @param {Object} options - Generation options
 * @param {string} options.userId - User ID
 * @param {string} options.category - Preferred category (optional)
 * @param {string} options.difficulty - Preferred difficulty (optional)
 * @param {Object} options.location - User location (optional)
 * @param {string} options.timezone - User's timezone (e.g., 'America/New_York') (optional, defaults to UTC)
 * @param {Object} options.userContext - User context for personalization
 * @returns {Object} Daily challenge object
 */
async function getOrGenerateDailyChallenge(options = {}) {
  const {
    userId,
    category,
    difficulty,
    location,
    timezone = 'UTC',
    forceRegenerate = false,
    userContext = {},
  } = options;

  // Get today's date in user's timezone as a string key (YYYY-MM-DD)
  // This ensures the challenge resets at midnight in the user's local time
  let dateKey;
  try {
    // Use Intl.DateTimeFormat to get date in user's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dateKey = formatter.format(now); // Returns YYYY-MM-DD format
  } catch (error) {
    console.warn('Invalid timezone, using UTC:', timezone, error);
    // Fallback to UTC if timezone is invalid
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    dateKey = today.toISOString().split('T')[0];
  }
  
  // Check if daily challenge already exists for today
  // If forceRegenerate is true, skip cache check and generate new challenge
  if (userId && !options.forceRegenerate) {
    try {
      const dailyChallengeRef = db.collection('dailyChallenges')
        .where('userId', '==', userId)
        .where('date', '==', dateKey)
        .limit(1);
      
      const snapshot = await dailyChallengeRef.get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const cachedChallenge = doc.data();
        
        // Get the full challenge details
        if (cachedChallenge.challengeId) {
          const challengeRef = db.collection('challenges').doc(cachedChallenge.challengeId);
          const challengeDoc = await challengeRef.get();
          
          if (challengeDoc.exists) {
            console.log(`✅ Using cached daily challenge for user ${userId} (date ${dateKey})`);
            return {
              id: challengeDoc.id,
              ...challengeDoc.data(),
            };
          } else {
            // Cached challenge ID doesn't exist anymore, delete the cache and generate new one
            console.warn(`⚠️ Cached challenge ID ${cachedChallenge.challengeId} not found in 'challenges' collection. Deleting invalid cache entry.`);
            await doc.ref.delete();
            // Continue to generate new challenge below
          }
        } else {
          // Cache entry has no challengeId, delete it
          console.warn(`⚠️ Cached daily challenge for user ${userId} (date ${dateKey}) has no challengeId. Deleting invalid cache entry.`);
          await doc.ref.delete();
          // Continue to generate new challenge below
        }
      }
    } catch (error) {
      console.warn('Error checking cached daily challenge:', error);
      // Continue to generate new challenge
    }
  } else if (options.forceRegenerate) {
    console.log(`🔄 Force regenerating daily challenge for user ${userId} (date ${dateKey})...`);
    // Delete existing cache for today if force regenerating
    try {
      const dailyChallengeRef = db.collection('dailyChallenges')
        .where('userId', '==', userId)
        .where('date', '==', dateKey);
      const snapshot = await dailyChallengeRef.get();
      snapshot.docs.forEach(doc => doc.ref.delete());
      console.log(`🗑️ Deleted existing cache for user ${userId} (date ${dateKey})`);
    } catch (error) {
      console.warn('Error deleting existing cache:', error);
    }
  }

  // No cached challenge found, generate a new one
  console.log(`✨ Generating new daily challenge for user ${userId} (date ${dateKey})...`);
  console.log(`📋 Generation options:`, { category, difficulty, hasLocation: !!location, hasUserContext: !!userContext });
  
  // If test category is selected, log it clearly
  if (category === 'test') {
    console.log(`🧪 TEST MODE: Generating "drink water" challenge for testing`);
  }
  
  let challenge;
  try {
    challenge = await generateAndSaveChallenge({
      category,
      difficulty,
      userContext,
      location,
      isDaily: true, // Mark as daily challenge
    });
  } catch (genError) {
    console.error(`❌ Failed to generate challenge for user ${userId}:`, genError);
    throw new Error(`Failed to generate daily challenge: ${genError.message}`);
  }

  if (!challenge || !challenge.id) {
    console.error(`❌ Generated challenge is invalid:`, challenge);
    throw new Error("Generated challenge is missing ID or data");
  }
  
  console.log(`✅ Successfully generated challenge ${challenge.id} for user ${userId}`);

  // Cache the daily challenge if user is logged in
  if (userId && challenge.id) {
    try {
      await db.collection('dailyChallenges').add({
        userId,
        challengeId: challenge.id,
        date: dateKey,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`💾 Daily challenge cached for user ${userId} (date ${dateKey})`);
    } catch (error) {
      console.warn('Error caching daily challenge:', error);
      // Continue even if caching fails
    }
  }

  return challenge;
}

module.exports = {
  generateChallenge,
  generateAndSaveChallenge,
  generateMultipleChallenges,
  getOrGenerateDailyChallenge,
  CHALLENGE_CATEGORIES,
  DIFFICULTY_LEVELS,
  // Export template system for future customization
  challengeTemplates: require("./challengeTemplates"),
};

