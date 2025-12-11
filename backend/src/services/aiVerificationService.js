/**
 * AI + RAG service for verifying challenge photos with Google Gemini
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini client (only if API key is set)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Simple RAG style knowledge base,
// you can expand this with more detailed rules per challenge type.
const KNOWLEDGE_BASE = [
  {
    id: "outdoor_generic",
    tags: ["outdoor", "outside", "explore", "park", "nature"],
    prompt:
      "The user should clearly be outside. Look for sky, trees, streets, grass, or buildings in the background. Indoor backgrounds, for example walls, beds, desks or kitchens, should not count.",
  },
  {
    id: "social_selfie",
    tags: ["friends", "social", "party", "group"],
    prompt:
      "The user should be in the photo with at least one other person. A selfie with only one face does not count as a social challenge.",
  },
  {
    id: "exercise_generic",
    tags: ["run", "jog", "exercise", "gym", "workout", "fitness"],
    prompt:
      "The user should appear to be exercising, for example running, using gym equipment, stretching on a mat, or on a sports field. A random selfie at a desk or in bed should not count.",
  },
  {
    id: "default",
    tags: [],
    prompt:
      "The image should show strong visual evidence that the user really did what the challenge description says. If the image is vague or unrelated, mark it as not completed.",
  },
];

/**
 * Pick the most relevant RAG prompt based on challenge fields.
 * You can refine this matching later.
 */
function pickRagContext(challenge) {
  const text =
    (
      (challenge.title || "") +
      " " +
      (challenge.description || "") +
      " " +
      (challenge.category || "")
    ).toLowerCase();

  let best = null;

  for (const kb of KNOWLEDGE_BASE) {
    if (kb.id === "default") continue;
    if (kb.tags.some((tag) => text.includes(tag))) {
      best = kb;
      break;
    }
  }

  if (!best) {
    best = KNOWLEDGE_BASE.find((kb) => kb.id === "default");
  }

  return best;
}

/**
 * Fetch image from URL and convert to base64
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    // Use Node.js built-in fetch (Node 18+) or dynamic import for node-fetch
    let fetch;
    if (typeof globalThis.fetch === 'function') {
      // Node.js 18+ has built-in fetch
      fetch = globalThis.fetch;
    } else {
      // Fallback to dynamic import for older Node versions
      const nodeFetch = await import("node-fetch");
      fetch = nodeFetch.default;
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return {
      data: buffer.toString("base64"),
      mimeType: response.headers.get("content-type") || "image/jpeg",
    };
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

/**
 * Verify a challenge photo with Google Gemini.
 *
 * Input:
 *   challenge: Firestore challenge document (title, description, category...)
 *   photoUrl: public HTTPS URL to Firebase Storage image
 *   location: optional { latitude, longitude, ... } object
 *
 * Output:
 *   { verified: boolean, confidence: number [0,1], reasoning: string }
 */
async function verifyChallengePhoto({ challenge, photoUrl, location }) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set, skipping AI verification.");
    return {
      verified: false,
      confidence: 0,
      reasoning: "AI verification not run because API key is missing.",
    };
  }

  if (!photoUrl) {
    return {
      verified: false,
      confidence: 0,
      reasoning: "No photo URL was provided.",
    };
  }

  if (!genAI) {
    return {
      verified: false,
      confidence: 0,
      reasoning: "AI verification not available (GEMINI_API_KEY not set).",
    };
  }

  const ragContext = pickRagContext(challenge);

  const challengeText = [
    challenge.title || "",
    challenge.description || "",
  ]
    .filter(Boolean)
    .join(" – ");

  const locationHint = location
    ? `The app also recorded this approximate location data (may be noisy): ${JSON.stringify(
        location
      )}.`
    : "There is no additional location information.";

  const systemPrompt =
    "You are an assistant that verifies whether a selfie or photo is strong visual evidence that a user completed a challenge in a mobile app. False positives are much worse than false negatives.";

  const userPrompt = `
CHALLENGE TASK (from the app):
"${challengeText}"

RAG CONTEXT (what to look for in the image):
${ragContext.prompt}

Extra context:
${locationHint}

Look at the attached image and decide if it is strong evidence that the user completed this challenge.

Return ONLY a single JSON object with this exact shape:

{
  "verified": true or false,
  "confidence": number between 0 and 1,
  "reasoning": "short explanation for the app logs"
}
`;

  try {
    // Get the Gemini model
    // Using gemini-2.5-flash (fast, free tier supported) or gemini-flash-latest
    // Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest, gemini-pro-latest
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" // Fast model with vision support
    });

    // Fetch and convert image to base64
    const imageData = await fetchImageAsBase64(photoUrl);

    // Generate content with image
    // Gemini API format: text prompt + image part
    const result = await model.generateContent([
      {
        text: systemPrompt + "\n\n" + userPrompt,
      },
      {
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let parsed;
    try {
      // Look for JSON in the response (might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(text);
      }
    } catch (err) {
      console.error("Failed to parse AI JSON, raw content:", text);
      return {
        verified: false,
        confidence: 0,
        reasoning:
          "AI returned an unexpected format while verifying the photo.",
      };
    }

    // Ensure verified is a strict boolean true/false
    let verified = false;
    if (parsed.verified === true || parsed.verified === "true") {
      verified = true;
    } else if (parsed.verified === false || parsed.verified === "false") {
      verified = false;
    } else {
      // Fallback: use truthy check but log warning
      verified = !!parsed.verified;
      console.warn('AI returned non-boolean verified value:', parsed.verified, typeof parsed.verified);
    }
    
    return {
      verified: verified, // Explicit boolean
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      reasoning: parsed.reasoning || "No reasoning provided by AI.",
    };
  } catch (err) {
    console.error("Error calling Gemini for photo verification:", err);
    return {
      verified: false,
      confidence: 0,
      reasoning: `AI verification failed: ${err.message}`,
    };
  }
}

module.exports = {
  verifyChallengePhoto,
};
