/**
 * Script to check the actual status and verified values of userChallenges
 */

require('dotenv').config();
const { db } = require('./src/config/firebase');

const COLLECTION_NAME = 'userChallenges';

async function checkChallengeStatus() {
  console.log('🔍 Checking userChallenge status and verified values...\n');

  try {
    // Get all userChallenges
    const snapshot = await db.collection(COLLECTION_NAME).get();

    console.log(`Found ${snapshot.size} total userChallenges\n`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userChallengeId = doc.id;

      console.log(`📋 UserChallenge: ${userChallengeId}`);
      console.log(`   Challenge ID: ${data.challengeId}`);
      console.log(`   Status: ${data.status} (type: ${typeof data.status})`);
      console.log(`   Verified: ${data.verified} (type: ${typeof data.verified})`);
      console.log(`   Completed At: ${data.completedAt ? data.completedAt.toDate() : 'null'}`);
      console.log(`   Verified At: ${data.verifiedAt ? data.verifiedAt.toDate() : 'null'}`);
      
      // Check if it should be in completed
      const isCompleted = data.status === "completed" && data.verified === true;
      console.log(`   Should be in Completed: ${isCompleted}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
checkChallengeStatus()
  .then(() => {
    console.log('✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

