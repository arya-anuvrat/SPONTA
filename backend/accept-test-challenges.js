/**
 * Script to accept test challenges for a user
 * Usage: node accept-test-challenges.js <userEmail>
 * Or: node accept-test-challenges.js <userId>
 */

require('dotenv').config();
const { auth } = require('./src/config/firebase');
const { acceptChallenge } = require('./src/services/challengeService');

// Test challenge IDs created earlier
const TEST_CHALLENGE_IDS = [
  'kinBlpIpkcGivAPb9cFV',
  'ffvUTJcqwvMHKEXBIF0f',
  '0OBUalc0hlOIJAvPh4TS',
  'cP6qqI6qSETT8A0MqINq',
  'fWUsjoL6ytSqchoHFcw1',
];

async function acceptTestChallenges(userIdentifier) {
  console.log('🔄 Accepting test challenges...\n');

  let userId;

  // Check if userIdentifier is an email or UID
  if (userIdentifier.includes('@')) {
    // It's an email - get user by email
    try {
      const user = await auth.getUserByEmail(userIdentifier);
      userId = user.uid;
      console.log(`✅ Found user: ${user.email} (UID: ${userId})\n`);
    } catch (error) {
      console.error(`❌ Error finding user by email: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Assume it's a UID
    try {
      const user = await auth.getUser(userIdentifier);
      userId = userIdentifier;
      console.log(`✅ Using user UID: ${userId} (Email: ${user.email || 'N/A'})\n`);
    } catch (error) {
      console.error(`❌ Error finding user by UID: ${error.message}`);
      process.exit(1);
    }
  }

  const acceptedChallenges = [];
  const errors = [];

  for (let i = 0; i < TEST_CHALLENGE_IDS.length; i++) {
    const challengeId = TEST_CHALLENGE_IDS[i];
    try {
      const result = await acceptChallenge(userId, challengeId);
      acceptedChallenges.push({ challengeId, ...result });
      console.log(`✅ Accepted challenge ${i + 1}/5: ${challengeId}`);
      if (result.alreadyAccepted) {
        console.log(`   (Already accepted)\n`);
      } else {
        console.log(`   Title: ${result.challenge.title}\n`);
      }
    } catch (error) {
      errors.push({ challengeId, error: error.message });
      console.error(`❌ Error accepting challenge ${i + 1} (${challengeId}):`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Accepted: ${acceptedChallenges.length}/5 challenges`);
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.length}`);
  }

  console.log('\n✅ Test challenges accepted!');
  console.log('   They should now appear in your "Incomplete Challenges" tab.');
  console.log('   You can verify them to test the RAG pipeline.');
}

// Get user identifier from command line
const userIdentifier = process.argv[2];

if (!userIdentifier) {
  console.error('❌ Error: Please provide a user email or UID');
  console.log('\nUsage:');
  console.log('  node accept-test-challenges.js <userEmail>');
  console.log('  node accept-test-challenges.js <userId>');
  console.log('\nExample:');
  console.log('  node accept-test-challenges.js user@example.com');
  process.exit(1);
}

// Run the script
acceptTestChallenges(userIdentifier)
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

