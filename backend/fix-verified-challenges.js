/**
 * Script to fix previously verified challenges that didn't get marked as completed
 * This will update any userChallenges where verified=true but status != "completed"
 */

require('dotenv').config();
const { db, admin } = require('./src/config/firebase');
const { USER_CHALLENGE_STATUS } = require('./src/utils/constants');

const COLLECTION_NAME = 'userChallenges';

async function fixVerifiedChallenges() {
  console.log('🔄 Fixing verified challenges that should be marked as completed...\n');

  try {
    // Get all userChallenges where verified is true but status is not completed
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('verified', '==', true)
      .get();

    console.log(`Found ${snapshot.size} userChallenges with verified=true\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userChallengeId = doc.id;

      // Check if status is already completed
      if (data.status === USER_CHALLENGE_STATUS.COMPLETED) {
        alreadyCorrect++;
        console.log(`✓ ${userChallengeId}: Already marked as completed`);
        continue;
      }

      // Fix: Update status to completed
      try {
        await db.collection(COLLECTION_NAME).doc(userChallengeId).update({
          status: USER_CHALLENGE_STATUS.COMPLETED,
          completedAt: data.completedAt || admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        fixed++;
        console.log(`✅ Fixed ${userChallengeId}: Updated status to "completed"`);
        console.log(`   Previous status: ${data.status}`);
        console.log(`   Verified: ${data.verified}`);
        console.log(`   Challenge ID: ${data.challengeId}\n`);
      } catch (error) {
        errors++;
        console.error(`❌ Error fixing ${userChallengeId}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total verified challenges: ${snapshot.size}`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Already correct: ${alreadyCorrect}`);
    console.log(`   Errors: ${errors}`);

    if (fixed > 0) {
      console.log('\n✅ Fixed challenges should now appear in "Completed Challenges" tab!');
    } else {
      console.log('\n✨ All verified challenges are already correctly marked as completed.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
fixVerifiedChallenges()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

