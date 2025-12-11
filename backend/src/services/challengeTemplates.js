/**
 * Challenge Templates - Custom challenge generation system
 * This is "our" challenge generation logic - templates + AI enhancement
 */

// Challenge templates with variables that AI will fill in
const CHALLENGE_TEMPLATES = {
  adventure: [
    {
      template: "Explore {location_type} you've never visited before and {action}",
      variables: {
        location_type: ["a new neighborhood", "a hidden park", "a local landmark", "a campus building"],
        action: ["take 5 photos", "find 3 interesting things", "talk to someone there", "discover a secret spot"],
      },
      basePoints: 15,
      baseDuration: 45,
    },
    {
      template: "Go on a {transportation} adventure to {destination_type} and {challenge_action}",
      variables: {
        transportation: ["walking", "biking", "public transit"],
        destination_type: ["a new area", "a different part of campus", "a nearby town"],
        challenge_action: ["document your journey", "try something new there", "meet someone new"],
      },
      basePoints: 20,
      baseDuration: 60,
    },
  ],
  
  social: [
    {
      template: "Start a conversation with {person_type} and learn {learning_goal}",
      variables: {
        person_type: ["a stranger", "someone new in class", "a campus staff member", "a fellow student"],
        learning_goal: ["something interesting about them", "their favorite hobby", "a fun fact", "their story"],
      },
      basePoints: 15,
      baseDuration: 15,
    },
    {
      template: "Organize or join a {activity_type} with {group_size} people and {group_action}",
      variables: {
        activity_type: ["study group", "coffee meetup", "game session", "walk"],
        group_size: ["at least 2", "3-5", "a small group"],
        group_action: ["have fun together", "complete a task", "share experiences"],
      },
      basePoints: 25,
      baseDuration: 60,
    },
  ],
  
  creative: [
    {
      template: "Create {art_type} using {materials} and {creative_action}",
      variables: {
        art_type: ["art", "music", "writing", "photography"],
        materials: ["found materials", "digital tools", "your phone", "basic supplies"],
        creative_action: ["share it online", "show a friend", "document the process"],
      },
      basePoints: 20,
      baseDuration: 60,
    },
    {
      template: "Learn {skill_type} by {learning_method} and {demonstration}",
      variables: {
        skill_type: ["a new art technique", "a song", "a recipe", "a craft"],
        learning_method: ["watching tutorials", "following a guide", "trial and error"],
        demonstration: ["create something", "perform it", "show your progress"],
      },
      basePoints: 25,
      baseDuration: 90,
    },
  ],
  
  fitness: [
    {
      template: "Complete a {workout_type} workout for {duration} minutes {location_context}",
      variables: {
        workout_type: ["cardio", "strength", "yoga", "HIIT"],
        duration: ["20", "30", "45"],
        location_context: ["outdoors", "at the gym", "in your room", "at a park"],
      },
      basePoints: 15,
      baseDuration: 30,
    },
    {
      template: "Try a new {activity_type} activity like {examples} and {challenge_goal}",
      variables: {
        activity_type: ["sports", "fitness", "outdoor"],
        examples: ["rock climbing", "dancing", "swimming", "hiking"],
        challenge_goal: ["complete a session", "learn the basics", "try for 30 minutes"],
      },
      basePoints: 20,
      baseDuration: 60,
    },
  ],
  
  academic: [
    {
      template: "Learn about {topic_type} by {learning_method} and {application}",
      variables: {
        topic_type: ["a new subject", "a different culture", "a scientific concept", "a historical event"],
        learning_method: ["reading articles", "watching documentaries", "taking notes", "researching"],
        application: ["explain it to someone", "write about it", "create a summary"],
      },
      basePoints: 20,
      baseDuration: 60,
    },
    {
      template: "Master {skill_type} by {practice_method} and {demonstration}",
      variables: {
        skill_type: ["a new language", "a programming concept", "a study technique", "a research method"],
        practice_method: ["practicing for 1 hour", "completing exercises", "building a project"],
        demonstration: ["show your progress", "create something", "teach someone"],
      },
      basePoints: 25,
      baseDuration: 90,
    },
  ],
  
  wellness: [
    {
      template: "Practice {wellness_activity} for {duration} minutes and {reflection}",
      variables: {
        wellness_activity: ["meditation", "mindfulness", "breathing exercises", "stretching"],
        duration: ["10", "15", "20"],
        reflection: ["reflect on your day", "set intentions", "practice gratitude"],
      },
      basePoints: 10,
      baseDuration: 15,
    },
    {
      template: "Take a {break_type} break to {wellness_action} and {benefit}",
      variables: {
        break_type: ["digital", "study", "work"],
        wellness_action: ["go for a walk", "do something creative", "connect with nature"],
        benefit: ["recharge", "reduce stress", "improve focus"],
      },
      basePoints: 15,
      baseDuration: 30,
    },
  ],
  
  test: [
    {
      template: "drink water",
      variables: {},
      basePoints: 10,
      baseDuration: 5,
      fixed: true, // This template always generates the same challenge
    },
  ],
  
  exploration: [
    {
      template: "Try {new_experience} at {location_type} and {documentation}",
      variables: {
        new_experience: ["a new restaurant", "a new activity", "a new place", "a new event"],
        location_type: ["on campus", "in your city", "nearby", "locally"],
        documentation: ["take photos", "write about it", "share your experience"],
      },
      basePoints: 15,
      baseDuration: 60,
    },
    {
      template: "Discover {discovery_type} in {location_context} and {action}",
      variables: {
        discovery_type: ["hidden gems", "new spots", "local secrets", "interesting places"],
        location_context: ["your area", "campus", "nearby", "your city"],
        action: ["explore them", "document them", "share with friends"],
      },
      basePoints: 20,
      baseDuration: 45,
    },
  ],
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
  easy: { points: 1.0, duration: 0.8 },
  medium: { points: 1.5, duration: 1.0 },
  hard: { points: 2.0, duration: 1.5 },
};

/**
 * Select a random template for a category
 */
function selectTemplate(category) {
  const templates = CHALLENGE_TEMPLATES[category] || CHALLENGE_TEMPLATES.adventure;
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Fill template variables with AI-generated or random values
 */
function fillTemplateVariables(template, useAI = true) {
  let filledTemplate = template.template;
  const filledVars = {};
  
  for (const [varName, options] of Object.entries(template.variables)) {
    // For now, use random selection. AI can enhance this later.
    const selected = options[Math.floor(Math.random() * options.length)];
    filledVars[varName] = selected;
    filledTemplate = filledTemplate.replace(`{${varName}}`, selected);
  }
  
  return {
    filledText: filledTemplate,
    variables: filledVars,
  };
}

/**
 * Generate challenge using template + AI enhancement
 */
async function generateFromTemplate(category, difficulty, userContext = {}, location = null, customDescription = null, peopleCount = null) {
  // Select template
  const template = selectTemplate(category);
  
  // Log if test category is being used
  if (category === 'test') {
    console.log(`🧪 TEST CATEGORY: Selected template:`, template);
  }
  
  // For fixed templates (like test category), return directly without AI enhancement
  if (template.fixed) {
    // Capitalize first letter of title
    const title = template.template.charAt(0).toUpperCase() + template.template.slice(1);
    console.log(`🧪 FIXED TEMPLATE: Generating challenge with title: "${title}"`);
    return {
      title: title,
      description: template.template + " solo",
      category: category,
      difficulty: difficulty || "easy",
      points: template.basePoints || 10,
      duration: template.baseDuration || 5,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: "daily",
      location: { type: "anywhere" },
    };
  }
  
  // Fill basic variables
  const { filledText, variables } = fillTemplateVariables(template);
  
  // Enhance with AI to make it more creative and unique
  const enhanced = await enhanceWithAI({
    baseText: filledText,
    category,
    difficulty,
    variables,
    userContext,
    location,
    customDescription,
    peopleCount,
  });
  
  // Calculate points and duration
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const points = Math.round(template.basePoints * multiplier.points);
  const duration = Math.round(template.baseDuration * multiplier.duration);
  
  return {
    title: enhanced.title,
    description: enhanced.description,
    category,
    difficulty,
    points,
    duration,
    requiresPhoto: enhanced.requiresPhoto !== undefined ? enhanced.requiresPhoto : true,
    requiresLocation: enhanced.requiresLocation !== undefined ? enhanced.requiresLocation : false,
    frequency: enhanced.frequency || "daily",
    location: enhanced.location || { type: "anywhere" },
  };
}

/**
 * Enhance template with AI to make it more creative
 */
async function enhanceWithAI({ baseText, category, difficulty, variables, userContext, location, customDescription, peopleCount }) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  
  if (!process.env.GEMINI_API_KEY) {
    // Fallback: just use the template text
    return {
      title: baseText.substring(0, 50),
      description: baseText,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: "daily",
    };
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
You are Sponta AI, a challenge generator for college students.

BASE CHALLENGE TEMPLATE: "${baseText}"
CATEGORY: ${category}
DIFFICULTY: ${difficulty}
VARIABLES USED: ${JSON.stringify(variables)}
${userContext.displayName ? `USER: ${userContext.displayName}` : ""}
${location ? `LOCATION: ${location.city || ""}, ${location.state || ""}` : ""}
${customDescription ? `USER'S CUSTOM REQUEST: "${customDescription}"` : ""}
${peopleCount ? `NUMBER OF PEOPLE: ${peopleCount}` : ""}

Enhance this challenge template to make it:
1. More specific and actionable
2. More engaging and fun
3. Unique and creative
4. Appropriate for a college student
${customDescription ? "5. Incorporate the user's custom request/description into the challenge" : ""}
${peopleCount ? `6. Make it suitable for ${peopleCount} people` : ""}

Return ONLY a JSON object:
{
  "title": "Catchy, short title (max 50 chars)",
  "description": "Enhanced, engaging description (1-2 sentences)",
  "requiresPhoto": true or false,
  "requiresLocation": true or false,
  "frequency": "daily" or "weekly",
  "location": { "type": "anywhere" or "specific" }
}

Return ONLY valid JSON, no markdown, no explanations.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
    
    return {
      title: parsed.title || baseText.substring(0, 50),
      description: parsed.description || baseText,
      requiresPhoto: parsed.requiresPhoto !== undefined ? parsed.requiresPhoto : true,
      requiresLocation: parsed.requiresLocation !== undefined ? parsed.requiresLocation : false,
      frequency: parsed.frequency || "daily",
      location: parsed.location || { type: "anywhere" },
    };
  } catch (error) {
    console.error("AI enhancement failed, using template:", error.message);
    // Fallback to template
    return {
      title: baseText.substring(0, 50),
      description: baseText,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: "daily",
    };
  }
}

module.exports = {
  CHALLENGE_TEMPLATES,
  DIFFICULTY_MULTIPLIERS,
  selectTemplate,
  fillTemplateVariables,
  generateFromTemplate,
  enhanceWithAI,
};

