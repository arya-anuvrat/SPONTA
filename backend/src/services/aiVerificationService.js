/**
 * AI + RAG service for verifying challenge photos with GPT-4o
 */

const OpenAI = require("openai");

// single OpenAI client for the whole backend
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Verify a challenge photo with GPT-4o.
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
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set, skipping AI verification.");
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                // Firebase Storage public URL
                url: photoUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const message = completion.choices[0]?.message?.content || [];
    const textPart = Array.isArray(message)
      ? message.find((part) => part.type === "text")
      : message;

    const rawText = textPart?.text || textPart || "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI JSON, raw content:", rawText);
      return {
        verified: false,
        confidence: 0,
        reasoning:
          "AI returned an unexpected format while verifying the photo.",
      };
    }

    return {
      verified: !!parsed.verified,
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      reasoning: parsed.reasoning || "No reasoning provided by AI.",
    };
  } catch (err) {
    console.error("Error calling GPT-4o for photo verification:", err);
    return {
      verified: false,
      confidence: 0,
      reasoning: "AI verification failed due to an API error.",
    };
  }
}

module.exports = {
  verifyChallengePhoto,
};
