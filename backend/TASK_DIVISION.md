# Backend Task Division - Arnav & Sukrit

## 🎯 Goal: Get Basic App Working First

---

## 📋 Phase 1: Foundation (Priority - Get This Working First)

### **Arnav's Tasks** (Foundation & Auth)
1. ✅ **Database Models & Schemas**
   - Create model files for User, Challenge, Event, UserChallenge
   - Define Firestore collection structures
   - Create validation schemas
   - **Files:** `src/models/User.js`, `src/models/Challenge.js`, `src/models/Event.js`, `src/models/UserChallenge.js`, `src/models/schemas.js`

2. ✅ **Authentication Middleware**
   - Implement JWT token verification
   - Create authentication middleware
   - **File:** `src/middleware/auth.js`

3. ✅ **Authentication Routes & Controller**
   - Implement signup endpoint
   - Implement signin endpoint
   - Phone verification integration
   - Token refresh endpoint
   - **Files:** `src/routes/authRoutes.js`, `src/controllers/authController.js`, `src/services/authService.js`

4. ✅ **Error Handling & Utilities**
   - Create custom error classes
   - Create validation utilities
   - Create constants file
   - **Files:** `src/utils/errors.js`, `src/utils/validators.js`, `src/utils/constants.js`

5. ✅ **Server Integration**
   - Wire up routes to server.js
   - Test basic endpoints

---

### **Sukrit's Tasks** (User Management & Challenges)
1. ✅ **User Routes & Controller**
   - GET /profile - Get user profile
   - PUT /profile - Update user profile
   - GET /stats - Get user statistics
   - **Files:** `src/routes/userRoutes.js`, `src/controllers/userController.js`, `src/services/userService.js`

2. ✅ **Challenge Routes & Controller**
   - GET / - Get all challenges
   - GET /:id - Get challenge by ID
   - GET /nearby - Get nearby challenges
   - POST /:id/accept - Accept a challenge
   - POST /:id/complete - Complete a challenge
   - **Files:** `src/routes/challengeRoutes.js`, `src/controllers/challengeController.js`, `src/services/challengeService.js`

3. ✅ **Progress Tracking Service**
   - Streak calculation logic
   - Points calculation
   - Daily progress tracking
   - **File:** `src/services/streakService.js`

---

## 📋 Phase 2: Events & Social (After Basic App Works)

### **Arnav's Tasks**
1. **Event Routes & Controller**
   - GET / - Get all events
   - GET /:id - Get event by ID
   - GET /nearby - Get nearby events
   - POST / - Create event
   - POST /:id/join - Join event
   - POST /:id/leave - Leave event
   - **Files:** `src/routes/eventRoutes.js`, `src/controllers/eventController.js`, `src/services/eventService.js`

2. **Location Utilities**
   - Nearby queries helper functions
   - Distance calculations
   - **File:** `src/utils/location.js`

### **Sukrit's Tasks**
1. **Social Features**
   - Friend system (add, accept, remove)
   - Friend routes
   - **Files:** `src/routes/socialRoutes.js`, `src/controllers/socialController.js`

2. **Reactions System**
   - Add/remove reactions
   - Reaction endpoints
   - **Files:** Update socialController.js

---

## 📋 Phase 3: Gamification (Polish)

### **Arnav's Tasks**
1. **Leaderboard Service**
   - Global leaderboards
   - College leaderboards
   - Friends leaderboards
   - **File:** `src/services/leaderboardService.js`

2. **Notification Service**
   - Create notifications
   - Send push notifications
   - **File:** `src/services/notificationService.js`

### **Sukrit's Tasks**
1. **Badge System**
   - Badge definitions
   - Badge earning logic
   - User badge tracking
   - **Files:** `src/services/badgeService.js`

---

## 🚀 Getting Started - Work Order

### **Step 1: Arnav Starts** (Foundation)
1. Create models and schemas
2. Implement auth middleware
3. Create error handling utilities
4. Implement basic auth routes (signup/signin)

### **Step 2: Sukrit Starts** (Once Auth Works)
1. Implement user routes
2. Create challenge service
3. Implement challenge routes

### **Step 3: Integration**
1. Test together
2. Fix any issues
3. Move to Phase 2

---

## 📝 API Endpoints Summary

### **Arnav's Endpoints (Phase 1)**
```
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/verify-phone
POST   /api/auth/refresh-token
```

### **Sukrit's Endpoints (Phase 1)**
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/stats
GET    /api/challenges
GET    /api/challenges/:id
GET    /api/challenges/nearby
POST   /api/challenges/:id/accept
POST   /api/challenges/:id/complete
```

---

## ✅ Definition of "Basic App Working"

The basic app is working when:
- ✅ Users can sign up and sign in
- ✅ Users can view their profile
- ✅ Users can see available challenges
- ✅ Users can accept challenges
- ✅ Users can complete challenges
- ✅ User stats (points, streak) are tracked

---

## 📞 Communication

- Update this file when tasks are completed
- Use clear commit messages
- Test endpoints with Postman/Thunder Client
- Share any blockers immediately

---

**Last Updated:** November 17, 2024




