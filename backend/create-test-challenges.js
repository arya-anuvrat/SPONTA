/**
 * Script to create 5 test challenges for RAG pipeline testing
 * Run with: node create-test-challenges.js
 */

require('dotenv').config();
const { createChallenge } = require('./src/models/Challenge');

async function createTestChallenges() {
  console.log('🔄 Creating 5 test challenges for RAG pipeline testing...\n');

  const testChallenges = [
    {
      title: 'drink water',
      description: 'drink water solo',
      category: 'wellness',
      difficulty: 'easy',
      points: 10,
      isActive: true,
      isFeatured: false,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: 'daily',
      location: { type: 'anywhere' },
    },
    {
      title: 'drink water',
      description: 'drink water solo',
      category: 'wellness',
      difficulty: 'easy',
      points: 10,
      isActive: true,
      isFeatured: false,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: 'daily',
      location: { type: 'anywhere' },
    },
    {
      title: 'drink water',
      description: 'drink water solo',
      category: 'wellness',
      difficulty: 'easy',
      points: 10,
      isActive: true,
      isFeatured: false,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: 'daily',
      location: { type: 'anywhere' },
    },
    {
      title: 'drink water',
      description: 'drink water solo',
      category: 'wellness',
      difficulty: 'easy',
      points: 10,
      isActive: true,
      isFeatured: false,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: 'daily',
      location: { type: 'anywhere' },
    },
    {
      title: 'drink water',
      description: 'drink water solo',
      category: 'wellness',
      difficulty: 'easy',
      points: 10,
      isActive: true,
      isFeatured: false,
      requiresPhoto: true,
      requiresLocation: false,
      frequency: 'daily',
      location: { type: 'anywhere' },
    },
  ];

  const createdChallenges = [];

  for (let i = 0; i < testChallenges.length; i++) {
    try {
      const challenge = await createChallenge(testChallenges[i]);
      createdChallenges.push(challenge);
      console.log(`✅ Created challenge ${i + 1}/5: ${challenge.id}`);
      console.log(`   Title: ${challenge.title}`);
      console.log(`   Description: ${challenge.description}\n`);
    } catch (error) {
      console.error(`❌ Error creating challenge ${i + 1}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${createdChallenges.length}/5 challenges`);
  console.log('\n📝 Challenge IDs (use these to accept and verify):');
  createdChallenges.forEach((challenge, index) => {
    console.log(`   ${index + 1}. ${challenge.id}`);
  });

  console.log('\n✅ Test challenges created successfully!');
  console.log('   You can now accept these challenges and test the RAG pipeline verification.');
}

// Run the script
createTestChallenges()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

