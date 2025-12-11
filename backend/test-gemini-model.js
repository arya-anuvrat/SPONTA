/**
 * Quick test to check which Gemini models are available
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
  "gemini-pro",
  "gemini-1.5-pro", 
  "gemini-1.5-flash",
  "models/gemini-pro",
  "models/gemini-1.5-pro"
];

async function testModels() {
  console.log('Testing available Gemini models...\n');
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'test'");
      const response = result.response;
      console.log(`✅ ${modelName} - WORKS!`);
      break; // Found working model
    } catch (error) {
      console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
    }
  }
}

testModels();



