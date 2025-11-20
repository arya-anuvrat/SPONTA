/**
 * Seed Data Script - Populate database with sample data for testing
 * Run with: node seed-data.js
 */

require('dotenv').config();
const { db } = require('./src/config/firebase');
const { createChallenge } = require('./src/models/Challenge');
const { createEvent } = require('./src/models/Event');

// Sample Challenges Data
const sampleChallenges = [
  {
    title: 'Try a New Coffee Shop',
    description: 'Visit a coffee shop you\'ve never been to before and try their signature drink.',
    category: 'exploration',
    difficulty: 'easy',
    points: 10,
    duration: 30,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: true,
    requiresLocation: true,
    frequency: 'daily',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Strike Up a Conversation',
    description: 'Start a conversation with a stranger and learn something new about them.',
    category: 'social',
    difficulty: 'medium',
    points: 15,
    duration: 15,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: false,
    requiresLocation: false,
    frequency: 'daily',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Take a 30-Minute Walk',
    description: 'Go for a 30-minute walk in a new area or park you haven\'t explored.',
    category: 'fitness',
    difficulty: 'easy',
    points: 10,
    duration: 30,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: true,
    requiresLocation: true,
    frequency: 'daily',
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Learn a New Skill',
    description: 'Spend 1 hour learning something completely new - a language, instrument, or craft.',
    category: 'academic',
    difficulty: 'hard',
    points: 25,
    duration: 60,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: true,
    requiresLocation: false,
    frequency: 'weekly',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Cook a New Recipe',
    description: 'Try cooking a dish you\'ve never made before from a different cuisine.',
    category: 'creative',
    difficulty: 'medium',
    points: 20,
    duration: 60,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: true,
    requiresLocation: false,
    frequency: 'weekly',
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Attend a Campus Event',
    description: 'Go to a campus event, club meeting, or student organization gathering.',
    category: 'social',
    difficulty: 'easy',
    points: 15,
    duration: 60,
    location: {
      type: 'specific',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      radius: 1000,
    },
    requiresPhoto: true,
    requiresLocation: true,
    frequency: 'weekly',
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Meditation Session',
    description: 'Complete a 10-minute meditation or mindfulness session.',
    category: 'wellness',
    difficulty: 'easy',
    points: 10,
    duration: 10,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: false,
    requiresLocation: false,
    frequency: 'daily',
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Volunteer for 2 Hours',
    description: 'Spend 2 hours volunteering for a cause you care about.',
    category: 'social',
    difficulty: 'hard',
    points: 30,
    duration: 120,
    location: {
      type: 'anywhere',
    },
    requiresPhoto: true,
    requiresLocation: true,
    frequency: 'weekly',
    isActive: true,
    isFeatured: true,
  },
];

// Sample Events Data
const sampleEvents = [
  {
    title: 'Campus Food Festival',
    description: 'Join us for a food festival featuring local vendors and student-made dishes!',
    category: 'social',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
    location: {
      name: 'Campus Quad',
      address: '123 University Ave, Campus',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    },
    minParticipants: 10,
    maxParticipants: 100,
    isPublic: true,
    tags: ['food', 'festival', 'campus'],
  },
  {
    title: 'Morning Yoga Session',
    description: 'Start your day with a relaxing yoga session in the park.',
    category: 'wellness',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
    location: {
      name: 'Central Park',
      address: 'Central Park, New York, NY',
      coordinates: {
        latitude: 40.7829,
        longitude: -73.9654,
      },
    },
    minParticipants: 5,
    maxParticipants: 30,
    isPublic: true,
    tags: ['yoga', 'wellness', 'morning'],
  },
  {
    title: 'Study Group - Computer Science',
    description: 'Weekly study group for CS students. All levels welcome!',
    category: 'academic',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    location: {
      name: 'Library Study Room 201',
      address: 'University Library, 2nd Floor',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    },
    minParticipants: 3,
    maxParticipants: 10,
    isPublic: true,
    tags: ['study', 'academic', 'cs'],
  },
];

/**
 * Seed challenges
 */
const seedChallenges = async () => {
  console.log('🌱 Seeding challenges...');
  const challengeIds = [];
  
  for (const challengeData of sampleChallenges) {
    try {
      const challenge = await createChallenge(challengeData);
      challengeIds.push(challenge.id);
      console.log(`  ✅ Created challenge: ${challenge.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to create challenge "${challengeData.title}":`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${challengeIds.length}/${sampleChallenges.length} challenges\n`);
  return challengeIds;
};

/**
 * Seed events
 */
const seedEvents = async () => {
  console.log('🌱 Seeding events...');
  const eventIds = [];
  
  for (const eventData of sampleEvents) {
    try {
      const event = await createEvent(eventData);
      eventIds.push(event.id);
      console.log(`  ✅ Created event: ${event.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to create event "${eventData.title}":`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${eventIds.length}/${sampleEvents.length} events\n`);
  return eventIds;
};

/**
 * Main seed function
 */
const seed = async () => {
  console.log('🚀 Starting database seeding...\n');
  console.log('='.repeat(50));
  
  try {
    // Seed challenges
    const challengeIds = await seedChallenges();
    
    // Seed events
    const eventIds = await seedEvents();
    
    console.log('='.repeat(50));
    console.log('\n✅ Seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Challenges: ${challengeIds.length}`);
    console.log(`   - Events: ${eventIds.length}`);
    console.log('\n🎉 Your database is now populated with sample data!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seed
seed();

