/**
 * Test script for AI verification service
 * Tests the RAG pipeline for challenge photo verification
 */

require('dotenv').config();
const { verifyChallengePhoto } = require('./src/services/aiVerificationService');

// Mock challenge data
const testChallenge = {
  title: "Go for a Run",
  description: "Take a 10-minute run outside",
  category: "fitness",
};

// Test photo URL (you can replace with a real Firebase Storage URL)
const testPhotoUrl = "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400"; // Sample running photo

async function testAIVerification() {
  console.log('🧪 Testing AI Verification Service...\n');
  
  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY not found in .env file');
    console.log('   The service will skip AI verification without the key.');
    console.log('   To test fully, add GEMINI_API_KEY to your .env file.');
    console.log('   Get your free key at: https://aistudio.google.com/\n');
  } else {
    console.log('✅ GEMINI_API_KEY found\n');
  }
  
  console.log('📋 Test Challenge:');
  console.log(`   Title: ${testChallenge.title}`);
  console.log(`   Description: ${testChallenge.description}`);
  console.log(`   Category: ${testChallenge.category}\n`);
  
  console.log('📸 Test Photo URL:', testPhotoUrl);
  console.log('   (Using sample Unsplash image for testing)\n');
  
  console.log('🔄 Calling AI verification service...\n');
  
  try {
    const result = await verifyChallengePhoto({
      challenge: testChallenge,
      photoUrl: testPhotoUrl,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    });
    
    console.log('✅ AI Verification Result:');
    console.log(`   Verified: ${result.verified}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Reasoning: ${result.reasoning}\n`);
    
    if (result.verified) {
      console.log('✅ Challenge would be marked as COMPLETED');
    } else {
      console.log('❌ Challenge would be marked as NOT COMPLETED');
    }
    
  } catch (error) {
    console.error('❌ Error testing AI verification:', error.message);
    console.error(error);
  }
}

// Run test
testAIVerification();

