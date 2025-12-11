/**
 * List available Gemini models for this API key
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Try to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTrying alternative method...');
    
    // Alternative: Try the SDK's listModels if available
    try {
      // Some SDKs have a listModels method
      console.log('Note: You may need to enable models in Google AI Studio');
      console.log('Go to: https://aistudio.google.com/');
      console.log('Check which models are available for your API key');
    } catch (e) {
      console.error('Alternative method failed:', e.message);
    }
  }
}

listModels();



