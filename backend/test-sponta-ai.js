/**
 * Test script for Sponta AI challenge generation
 */

require('dotenv').config();
const challengeGenerationService = require('./src/services/challengeGenerationService');

async function testSpontaAI() {
  console.log('🤖 Testing Sponta AI Challenge Generation...\n');
  
  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY not found in .env file');
    console.log('   Cannot generate challenges without the key.\n');
    return;
  }
  
  console.log('✅ GEMINI_API_KEY found\n');
  
  // Test 1: Generate a random challenge
  console.log('📋 Test 1: Generate Random Challenge');
  console.log('─'.repeat(50));
  try {
    const challenge = await challengeGenerationService.generateChallenge();
    console.log('✅ Challenge Generated:');
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Description: ${challenge.description}`);
    console.log(`   Category: ${challenge.category}`);
    console.log(`   Difficulty: ${challenge.difficulty}`);
    console.log(`   Points: ${challenge.points}`);
    console.log(`   Duration: ${challenge.duration} minutes\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: Generate challenge with specific category
  console.log('📋 Test 2: Generate Challenge with Category (fitness)');
  console.log('─'.repeat(50));
  try {
    const challenge = await challengeGenerationService.generateChallenge({
      category: 'fitness',
    });
    console.log('✅ Challenge Generated:');
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Category: ${challenge.category}`);
    console.log(`   Description: ${challenge.description}\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Generate and save challenge
  console.log('📋 Test 3: Generate and Save Challenge to Database');
  console.log('─'.repeat(50));
  try {
    const challenge = await challengeGenerationService.generateAndSaveChallenge({
      category: 'social',
      difficulty: 'easy',
    });
    console.log('✅ Challenge Generated and Saved:');
    console.log(`   ID: ${challenge.id}`);
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Category: ${challenge.category}`);
    console.log(`   Difficulty: ${challenge.difficulty}\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('🎉 Sponta AI testing complete!\n');
}

testSpontaAI();

