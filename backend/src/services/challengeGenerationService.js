/**
 * Sponta AI - Challenge Generation Service
 * Uses Google Gemini to generate random, personalized challenges
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createChallenge } = require("../models/Challenge");
const { validateChallengeSchema } = require("../models/schemas");

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
 * Generate a random challenge using Gemini AI
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

  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not set. Cannot generate challenges.");
  }

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

  const categoryInfo = CHALLENGE_CATEGORIES[selectedCategory];
  const difficultyInfo = DIFFICULTY_LEVELS[selectedDifficulty];

  // Build context for personalization
  let personalizationContext = "";
  if (userContext.displayName) {
    personalizationContext += `User: ${userContext.displayName}. `;
  }
  if (userContext.college?.name) {
    personalizationContext += `College: ${userContext.college.name}. `;
  }
  if (location) {
    personalizationContext += `Location: ${location.city || "Unknown"}, ${location.state || ""}. `;
  }

  const systemPrompt = `You are Sponta AI, a creative challenge generator for a college student spontaneity app. Generate fun, engaging, and achievable challenges that encourage students to step out of their comfort zones.`;

  const userPrompt = `
Generate a NEW, UNIQUE challenge for a college student spontaneity app.

CATEGORY: ${selectedCategory}
Category Description: ${categoryInfo.description}
Category Examples: ${categoryInfo.examples.join(", ")}

DIFFICULTY: ${selectedDifficulty}
Difficulty Description: ${difficultyInfo.description}
Points: ${difficultyInfo.points}
Duration: ${difficultyInfo.duration} minutes

${personalizationContext ? `USER CONTEXT:\n${personalizationContext}` : ""}

REQUIREMENTS:
1. The challenge must be specific and actionable
2. It should be fun and encourage spontaneity
3. It should be achievable for a college student
4. Make it unique - don't repeat common challenges
5. Keep the description concise (1-2 sentences)
6. Make it engaging and exciting

Return ONLY a JSON object with this exact structure:
{
  "title": "Short, catchy challenge title (max 50 characters)",
  "description": "Clear, engaging description of what the user should do (1-2 sentences)",
  "category": "${selectedCategory}",
  "difficulty": "${selectedDifficulty}",
  "points": ${difficultyInfo.points},
  "duration": ${difficultyInfo.duration},
  "requiresPhoto": true or false,
  "requiresLocation": true or false,
  "frequency": "daily" or "weekly",
  "location": {
    "type": "anywhere" or "specific"
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Fast model for generation
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(cleanedText);
      }
    } catch (err) {
      console.error("Failed to parse AI JSON response:", text);
      throw new Error("AI returned invalid JSON format");
    }

    // Validate and clean the generated challenge
    const challengeData = {
      title: parsed.title || "New Challenge",
      description: parsed.description || "Complete this challenge!",
      category: parsed.category || selectedCategory,
      difficulty: parsed.difficulty || selectedDifficulty,
      points: parsed.points || difficultyInfo.points,
      duration: parsed.duration || difficultyInfo.duration,
      requiresPhoto: parsed.requiresPhoto !== undefined ? parsed.requiresPhoto : true,
      requiresLocation: parsed.requiresLocation !== undefined ? parsed.requiresLocation : false,
      frequency: parsed.frequency || "daily",
      location: parsed.location || { type: "anywhere" },
      isActive: true,
      isFeatured: false,
    };

    // Validate the challenge data
    try {
      validateChallengeSchema(challengeData);
    } catch (validationError) {
      console.warn("Generated challenge failed validation, using defaults:", validationError.message);
      // Use defaults if validation fails
      challengeData.category = selectedCategory;
      challengeData.difficulty = selectedDifficulty;
    }

    return challengeData;
  } catch (error) {
    console.error("Error generating challenge with AI:", error);
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
};

