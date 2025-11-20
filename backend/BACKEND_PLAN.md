# SPONTA Backend Implementation Plan

## 📊 Current State Assessment

### ✅ What We Have
- Express server setup with middleware (Helmet, CORS, Morgan)
- Firebase Admin SDK configured
- Route files created (auth, user, challenge, event)
- Project structure organized
- Health check endpoint working

### ❌ What We Need
- Database schema/models
- Authentication implementation
- Route handlers (controllers)
- Business logic (services)
- Middleware implementation
- Error handling utilities
- Input validation

---

## 🗄️ Database Schema (Firestore Collections)

### 1. **users** Collection
```javascript
{
  uid: string,                    // Firebase Auth UID (document ID)
  phoneNumber: string,            // User's phone number
  email: string?,                  // Optional email
  displayName: string,            // User's name
  dateOfBirth: timestamp,         // Date of birth
  location: {
    city: string,
    state: string,
    country: string,
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  college: {
    name: string,
    verified: boolean
  },
  profilePicture: string?,         // Storage URL
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Gamification fields
  points: number,                 // Total points earned
  level: number,                  // User level
  currentStreak: number,          // Current streak days
  longestStreak: number,          // Longest streak achieved
  lastActivityDate: timestamp?,   // Last challenge/event completion
  
  // Social fields
  friends: array<string>,         // Array of friend UIDs
  friendRequests: {
    sent: array<string>,          // UIDs of sent requests
    received: array<string>       // UIDs of received requests
  },
  
  // Privacy settings
  privacySettings: {
    showOnLeaderboard: boolean,
    allowFriendRequests: boolean,
    showLocation: boolean
  }
}
```

### 2. **challenges** Collection
```javascript
{
  id: string,                     // Document ID
  title: string,
  description: string,
  category: string,               // e.g., "adventure", "social", "creative", "fitness"
  difficulty: string,              // "easy", "medium", "hard"
  
  // Challenge details
  points: number,                 // Points awarded on completion
  duration: number?,              // Estimated time in minutes
  location: {
    type: string,                 // "anywhere", "specific", "nearby"
    coordinates: {
      latitude: number?,
      longitude: number?
    },
    radius: number?               // In meters
  },
  
  // Requirements
  requiresPhoto: boolean,
  requiresLocation: boolean,
  minParticipants: number?,
  maxParticipants: number?,
  
  // Scheduling
  frequency: string,              // "daily", "weekly", "one-time"
  startDate: timestamp?,
  endDate: timestamp?,
  availableDays: array<string>?, // ["monday", "wednesday", "friday"]
  
  // Status
  isActive: boolean,
  isFeatured: boolean,
  
  // Metadata
  createdBy: string,              // Admin/system UID
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Statistics
  totalCompletions: number,
  totalAccepts: number
}
```

### 3. **userChallenges** Collection (User-Challenge Relationship)
```javascript
{
  id: string,                     // Document ID
  userId: string,                  // User UID
  challengeId: string,            // Challenge ID
  status: string,                 // "accepted", "completed", "failed"
  
  // Completion details
  acceptedAt: timestamp,
  completedAt: timestamp?,
  photoUrl: string?,              // Verification photo
  location: {
    latitude: number?,
    longitude: number?
  },
  
  // Verification
  verified: boolean,
  verifiedAt: timestamp?,
  verifiedBy: string?,            // System/admin UID
  
  // Points
  pointsEarned: number,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. **events** Collection
```javascript
{
  id: string,                     // Document ID
  title: string,
  description: string,
  category: string,
  
  // Event details
  startTime: timestamp,
  endTime: timestamp,
  location: {
    name: string,                 // Venue name
    address: string,
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  
  // Participants
  createdBy: string,              // User UID
  participants: array<string>,    // Array of user UIDs
  maxParticipants: number?,
  minParticipants: number,
  
  // Status
  status: string,                 // "upcoming", "ongoing", "completed", "cancelled"
  isPublic: boolean,
  
  // Metadata
  coverImage: string?,            // Storage URL
  tags: array<string>,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. **userProgress** Collection (Daily Progress Tracking)
```javascript
{
  id: string,                     // Document ID (userId_date format)
  userId: string,                  // User UID
  date: timestamp,                 // Date (start of day)
  
  // Daily stats
  challengesCompleted: number,
  eventsAttended: number,
  pointsEarned: number,
  
  // Streak tracking
  streakCount: number,            // Current streak
  isStreakActive: boolean,        // Did user complete something today?
  
  // Activities
  completedChallenges: array<string>,  // userChallenge IDs
  attendedEvents: array<string>,       // Event IDs
  
  updatedAt: timestamp
}
```

### 6. **leaderboards** Collection (Denormalized for Performance)
```javascript
{
  id: string,                     // Document ID (e.g., "global_weekly", "college_monthly")
  type: string,                   // "global", "college", "friends"
  period: string,                 // "daily", "weekly", "monthly", "all-time"
  scope: string?,                 // College name or "global"
  
  rankings: array<{
    userId: string,
    displayName: string,
    profilePicture: string?,
    points: number,
    rank: number,
    change: number?                // Rank change from previous period
  }>,
  
  updatedAt: timestamp
}
```

### 7. **badges** Collection
```javascript
{
  id: string,                     // Document ID
  name: string,
  description: string,
  icon: string,                   // Icon URL or identifier
  category: string,                // "streak", "challenge", "social", "event"
  
  // Requirements
  requirement: {
    type: string,                 // "streak", "points", "challenges", "events"
    value: number
  },
  
  points: number,                 // Points awarded for earning badge
  rarity: string,                 // "common", "rare", "epic", "legendary"
  
  createdAt: timestamp
}
```

### 8. **userBadges** Collection
```javascript
{
  id: string,                     // Document ID
  userId: string,
  badgeId: string,
  earnedAt: timestamp,
  pointsEarned: number
}
```

### 9. **reactions** Collection (Social Interactions)
```javascript
{
  id: string,                     // Document ID
  userId: string,                  // User who reacted
  targetType: string,             // "challenge", "event", "userChallenge"
  targetId: string,                // ID of the target
  reactionType: string,           // "like", "fire", "wow", "support"
  createdAt: timestamp
}
```

### 10. **notifications** Collection
```javascript
{
  id: string,                     // Document ID
  userId: string,                  // Recipient UID
  type: string,                   // "friend_request", "challenge_complete", "event_reminder", etc.
  title: string,
  message: string,
  data: object,                   // Additional data (challengeId, eventId, etc.)
  read: boolean,
  createdAt: timestamp
}
```

---

## 🔌 API Endpoints Structure

### Authentication Routes (`/api/auth`)
```
POST   /signup              - Register new user
POST   /signin              - Sign in user
POST   /verify-phone        - Verify phone number
POST   /refresh-token       - Refresh JWT token
POST   /logout              - Logout user
GET    /me                  - Get current user info
```

### User Routes (`/api/users`)
```
GET    /profile             - Get user profile
PUT    /profile             - Update user profile
GET    /stats               - Get user statistics
GET    /friends             - Get friends list
POST   /friends/request     - Send friend request
POST   /friends/accept/:id   - Accept friend request
DELETE /friends/:id          - Remove friend
GET    /badges              - Get user badges
GET    /leaderboard         - Get leaderboard (global/college/friends)
```

### Challenge Routes (`/api/challenges`)
```
GET    /                    - Get all challenges (with filters)
GET    /:id                  - Get challenge by ID
GET    /nearby               - Get nearby challenges
POST   /:id/accept           - Accept a challenge
POST   /:id/complete         - Complete a challenge
GET    /:id/progress         - Get user's progress on challenge
GET    /categories           - Get challenge categories
```

### Event Routes (`/api/events`)
```
GET    /                    - Get all events (with filters)
GET    /:id                  - Get event by ID
GET    /nearby               - Get nearby events
POST   /                     - Create new event
PUT    /:id                  - Update event
DELETE /:id                  - Delete event
POST   /:id/join             - Join an event
POST   /:id/leave            - Leave an event
GET    /:id/participants     - Get event participants
```

### Social Routes (`/api/social`)
```
POST   /reactions            - Add reaction
DELETE /reactions/:id         - Remove reaction
GET    /feed                 - Get social feed
POST   /share                - Share achievement
```

---

## 📁 File Structure Plan

```
backend/src/
├── config/
│   └── firebase.js          ✅ (exists, needs review)
│
├── middleware/
│   ├── auth.js              ⚠️  (exists, needs implementation)
│   ├── validation.js        ❌ (create)
│   └── errorHandler.js      ❌ (create)
│
├── models/
│   ├── User.js              ❌ (create)
│   ├── Challenge.js          ❌ (create)
│   ├── Event.js              ❌ (create)
│   ├── UserChallenge.js     ❌ (create)
│   └── schemas.js            ❌ (create validation schemas)
│
├── controllers/
│   ├── authController.js    ❌ (create)
│   ├── userController.js    ❌ (create)
│   ├── challengeController.js ❌ (create)
│   ├── eventController.js  ❌ (create)
│   └── socialController.js  ❌ (create)
│
├── services/
│   ├── authService.js       ❌ (create)
│   ├── userService.js       ❌ (create)
│   ├── challengeService.js  ❌ (create)
│   ├── eventService.js      ❌ (create)
│   ├── streakService.js     ❌ (create)
│   ├── leaderboardService.js ❌ (create)
│   └── notificationService.js ❌ (create)
│
├── routes/
│   ├── authRoutes.js        ⚠️  (exists, needs implementation)
│   ├── userRoutes.js        ⚠️  (exists, needs implementation)
│   ├── challengeRoutes.js   ⚠️  (exists, needs implementation)
│   ├── eventRoutes.js       ⚠️  (exists, needs implementation)
│   └── socialRoutes.js      ❌ (create)
│
├── utils/
│   ├── errors.js            ❌ (create custom error classes)
│   ├── validators.js        ❌ (create validation helpers)
│   ├── location.js          ❌ (create location utilities)
│   └── constants.js         ❌ (create app constants)
│
└── server.js                ✅ (exists, needs route integration)
```

---

## 🚀 Implementation Priority Order

### Phase 1: Foundation (Week 1)
1. **Database Models & Schemas**
   - Create Firestore collection structures
   - Define validation schemas
   - Create model helper functions

2. **Authentication System**
   - Implement JWT middleware
   - Create auth service
   - Implement signup/signin endpoints
   - Phone verification integration

3. **User Management**
   - User profile CRUD
   - User statistics calculation
   - Basic user service

### Phase 2: Core Features (Week 2)
4. **Challenge System**
   - Challenge CRUD operations
   - Accept/complete challenge logic
   - Challenge assignment (daily/weekly)
   - Nearby challenges query

5. **Event System**
   - Event CRUD operations
   - Join/leave event functionality
   - Event discovery

6. **Progress Tracking**
   - Streak calculation service
   - Points system
   - Daily progress tracking

### Phase 3: Social & Gamification (Week 3)
7. **Social Features**
   - Friend system
   - Reactions system
   - Social feed

8. **Gamification**
   - Badge system
   - Leaderboard service
   - Achievement tracking

9. **Polish & Testing**
   - Error handling improvements
   - Input validation
   - Performance optimization
   - Testing with demo data

---

## 🔐 Security Considerations

1. **Authentication**
   - JWT token validation
   - Token refresh mechanism
   - Secure password handling (if email auth added)

2. **Authorization**
   - User can only modify their own data
   - Event creators can manage their events
   - Admin-only endpoints

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage
   - Prevent injection attacks

4. **Rate Limiting**
   - Implement rate limiting for auth endpoints
   - Prevent abuse of API

5. **Data Privacy**
   - Respect privacy settings
   - Secure location data
   - Protect user information

---

## 📝 Next Steps

1. **Start with Models & Schemas** - Define data structures
2. **Implement Authentication** - Core security foundation
3. **Build User System** - Profile and stats
4. **Create Challenge System** - Core app feature
5. **Add Event System** - Social gatherings
6. **Implement Progress Tracking** - Gamification foundation
7. **Add Social Features** - Engagement
8. **Polish & Test** - Production readiness

---

## 🧪 Testing Strategy

1. **Unit Tests** - Test individual services and utilities
2. **Integration Tests** - Test API endpoints
3. **Manual Testing** - Test with Postman/Thunder Client
4. **Demo Data** - Create sample users, challenges, events
5. **Edge Cases** - Test error scenarios

---

**Last Updated:** November 17, 2024

