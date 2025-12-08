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
      location
    );

    // Add metadata
    challengeData.isActive = true;
    challengeData.isFeatured = false;

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
    // Generate challenge using AI
    const challengeData = await generateChallenge(options);

    // Save to database
    const challenge = await createChallenge(challengeData);

    return challenge;
  } catch (error) {
    console.error("Error generating and saving challenge:", error);
    throw error;
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

module.exports = {
  generateChallenge,
  generateAndSaveChallenge,
  generateMultipleChallenges,
  CHALLENGE_CATEGORIES,
  DIFFICULTY_LEVELS,
  // Export template system for future customization
  challengeTemplates: require("./challengeTemplates"),
};

