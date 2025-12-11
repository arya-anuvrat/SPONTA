# Sponta AI - Challenge Generation Guide

## ✅ Implementation Complete!

Sponta AI is now fully implemented and ready to generate unlimited unique challenges!

---

## 🎯 What is Sponta AI?

Sponta AI uses Google Gemini to generate **unique, personalized challenges** for college students. Instead of using static seed data, the app can now generate fresh challenges on-demand.

---

## 🔌 API Endpoints

### 1. Get Generation Info
**GET** `/api/challenges/generate/info`

Returns available categories and difficulty levels for challenge generation.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": {
      "adventure": { "description": "...", "examples": [...] },
      "social": { ... },
      ...
    },
    "difficulties": {
      "easy": { "description": "...", "points": 10, "duration": 30 },
      "medium": { ... },
      "hard": { ... }
    }
  }
}
```

### 2. Generate Single Challenge
**POST** `/api/challenges/generate`

Generates and saves one challenge to the database.

**Request Body (all optional):**
```json
{
  "category": "fitness",      // Optional: adventure, social, creative, fitness, academic, wellness, exploration
  "difficulty": "easy",       // Optional: easy, medium, hard
  "location": {               // Optional: for location-based challenges
    "city": "New York",
    "state": "NY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Challenge generated successfully",
  "data": {
    "id": "challenge_id",
    "title": "Generated Challenge Title",
    "description": "Challenge description...",
    "category": "fitness",
    "difficulty": "easy",
    "points": 10,
    "duration": 30,
    ...
  }
}
```

### 3. Generate Multiple Challenges
**POST** `/api/challenges/generate/batch`

Generates multiple challenges at once (max 10).

**Request Body:**
```json
{
  "count": 5,                 // Required: number of challenges (1-10)
  "category": "social",        // Optional
  "difficulty": "medium",      // Optional
  "location": { ... }          // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 5/5 challenges",
  "data": {
    "challenges": [...],
    "errors": [],
    "successCount": 5,
    "totalRequested": 5
  }
}
```

---

## 🧪 Testing

### Test via Script:
```bash
cd backend
node test-sponta-ai.js
```

### Test via API:
```bash
# Get generation info
curl http://localhost:3000/api/challenges/generate/info

# Generate a challenge
curl -X POST http://localhost:3000/api/challenges/generate \
  -H "Content-Type: application/json" \
  -d '{"category":"fitness","difficulty":"easy"}'

# Generate multiple challenges
curl -X POST http://localhost:3000/api/challenges/generate/batch \
  -H "Content-Type: application/json" \
  -d '{"count":3,"category":"social"}'
```

---

## 🎨 Features

### 1. **Random Generation**
- Generates completely unique challenges
- No duplicates
- Creative and engaging

### 2. **Category-Based**
- Generate challenges for specific categories
- 7 categories available: adventure, social, creative, fitness, academic, wellness, exploration

### 3. **Difficulty Levels**
- Easy (10 points, 30 min)
- Medium (20 points, 60 min)
- Hard (30 points, 120 min)

### 4. **Personalization** (when user is authenticated)
- Uses user's name, college, location
- Generates context-aware challenges

### 5. **Location-Aware**
- Can generate location-specific challenges
- Uses user's city/state if provided

---

## 📊 How It Works

1. **User/App requests challenge generation**
2. **Sponta AI service calls Gemini API**
3. **Gemini generates unique challenge based on:**
   - Category (if specified)
   - Difficulty (if specified)
   - User context (if authenticated)
   - Location (if provided)
4. **Challenge is validated and saved to Firestore**
5. **Challenge is returned to user**

---

## 🔧 Configuration

### Required:
- `GEMINI_API_KEY` in `.env` file
- Same key used for photo verification

### Free Tier Limits:
- 15 requests per minute
- 1,500 requests per day
- **Free forever!**

---

## 💡 Use Cases

### 1. Daily Challenge Generation
Generate a new challenge every day for users:
```javascript
// Generate daily challenge
POST /api/challenges/generate
```

### 2. Category-Specific Challenges
Generate challenges for specific categories:
```javascript
// Generate fitness challenges
POST /api/challenges/generate
{ "category": "fitness" }
```

### 3. Batch Generation
Generate multiple challenges at once:
```javascript
// Generate 10 challenges
POST /api/challenges/generate/batch
{ "count": 10 }
```

### 4. Personalized Challenges
Generate challenges based on user profile:
```javascript
// With authentication token
POST /api/challenges/generate
Headers: { "Authorization": "Bearer <token>" }
// Automatically uses user's college, location, etc.
```

---

## 🎯 Example Challenges Generated

**Fitness:**
- "Outdoor Gym Architect" - Transform campus space into a gym
- "Stairway to Fitness" - Complete stair workout challenge

**Social:**
- "The Campus Quirker" - Start conversations with strangers
- "Friend Finder" - Make 3 new connections today

**Academic:**
- "The Wiki Wanderer" - Explore Wikipedia for 60 minutes
- "Skill Sprint" - Learn a new skill in 1 hour

**Creative:**
- "Art Attack" - Create something with found materials
- "Photo Story" - Tell a story through 5 photos

---

## ✅ Status

**Implementation:** ✅ **COMPLETE**  
**Testing:** ✅ **PASSING**  
**API Endpoints:** ✅ **WORKING**  
**Database Integration:** ✅ **WORKING**

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Add "Generate Challenge" button
   - Show generated challenges
   - Allow users to request specific categories

2. **Scheduling:**
   - Auto-generate daily challenges
   - Generate weekly challenge sets
   - Personalize based on user preferences

3. **Enhancements:**
   - Save user preferences
   - Generate challenges based on past completions
   - Location-based challenge suggestions

---

**Sponta AI is ready to generate unlimited unique challenges!** 🎉

