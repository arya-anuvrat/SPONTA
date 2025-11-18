# SPONTA

## Gamified Spontaneity App for College Students

SPONTA is a mobile application that gamifies spontaneity for college students. It encourages users to step out of their comfort zones, discover new experiences, and connect with their community through challenges and events.

---

## 👥 Team Members

- **Anuvrat** - Frontend Development
- **Suraj** - Frontend Development
- **Arnav** - Backend Development
- **Sukrit** - Backend Development

---

## 🛠️ Tech Stack

### Frontend
- **React Native** with **Expo** - iOS mobile development
- **Firebase** - Authentication, Firestore Database, Cloud Storage
- **React Navigation** - Navigation library
- **Expo Location** - iOS location services
- **Expo Camera** - iOS camera access
- **Expo Notifications** - iOS push notifications
- **React Hook Form** - Form management

**Platform:** iOS only (iPhone & iPad)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Firebase Admin SDK** - Server-side Firebase operations
- **JWT** - Authentication tokens
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

---

## 📁 Project Structure

```
SPONTA/
├── frontend/           # React Native Expo app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # Screen components
│   │   │   └── onboarding/ # Onboarding flow screens
│   │   ├── navigation/     # Navigation configuration
│   │   ├── services/       # API and Firebase services
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── models/         # Data models/types
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── SETUP.md
```

---

## 🌿 Branching Strategy

The project uses a **feature branch workflow** with personal branches:

1. **main** - Default branch (working in-progress version, baseline)
2. **anuvrat** - Anuvrat's personal working branch
3. **arnav** - Arnav's personal working branch
4. **sukrit** - Sukrit's personal working branch
5. **suraj** - Suraj's personal working branch

### Workflow
1. **Always start from main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create/switch to your personal branch:**
   ```bash
   git checkout anuvrat  # or arnav, sukrit, suraj
   # If branch doesn't exist locally:
   git checkout -b anuvrat origin/anuvrat
   ```

3. **Work on your personal branch:**
   - Make your changes
   - Commit frequently with clear messages
   - Push to your personal branch: `git push origin anuvrat`

4. **When ready to merge:**
   - Create a Pull Request (PR) from your branch → `main`
   - Get at least one team member to review
   - After approval, merge to `main`
   - Update your personal branch: `git checkout main && git pull && git checkout anuvrat && git merge main`

5. **Before starting new work:**
   - Always pull latest changes from `main`
   - Merge `main` into your branch to stay up to date

---

## 📱 iOS Requirements

- **Minimum iOS Version:** iOS 13.0+
- **Target Devices:** iPhone and iPad
- **Development:** Expo Go app for iOS (App Store)
- **Testing:** iOS Simulator or physical iPhone/iPad
- **Deployment:** Apple App Store via EAS Build

---

## 🚀 Quick Start

### Prerequisites (iOS Development)
- **macOS** (required for iOS development)
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- **Xcode** (for iOS Simulator - optional but recommended)
- **Expo Go App** for iOS ([App Store](https://apps.apple.com/app/expo-go/id982107779))
- Firebase Account
- Apple Developer Account (for App Store deployment - optional)

### Setup Instructions

See [SETUP.md](./SETUP.md) for detailed step-by-step setup instructions.

### Quick Commands (iOS)

**Frontend:**
```bash
cd frontend
npm install
npm run ios              # Open in iOS Simulator
npm run ios:device       # Open on connected iPhone/iPad
```

**Backend:**
```bash
cd backend
npm install
npm start
```

---

## 🔥 Firebase Setup (iOS)

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Phone Auth)
3. Create Firestore Database
4. Enable Cloud Storage
5. **Add iOS App** in Firebase Console:
   - Bundle ID: `com.sponta.app`
   - Download `GoogleService-Info.plist`
   - Add to `ios/` folder (when using Expo Dev Build)
6. Generate service account key for backend
7. Copy configuration values to `.env` files

See [SETUP.md](./SETUP.md) for detailed Firebase configuration steps.

---

## 📱 App Features

### Phase 1: Onboarding & Authentication
- Landing screen
- Phone number authentication
- User profile setup (name, DOB, location)
- College verification

### Phase 2: Core Challenge System
- Daily/weekly challenges
- Challenge categories
- Accept and complete challenges
- Photo verification
- Points and rewards

### Phase 3: Social Features
- Friend system
- Leaderboards
- Share achievements
- Challenge recommendations

### Phase 4: Location-Based Features
- Nearby challenges
- Location-based events
- Campus-specific content

### Phase 5: Events & Groups
- Create and join events
- Group challenges
- Event discovery

### Phase 6: Gamification
- Badges and achievements
- Streaks
- Leveling system
- Rewards store

### Phase 7: Polish & Optimization
- Push notifications
- Analytics
- Performance optimization
- Bug fixes

---

## 🧪 Development Guidelines

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React Native best practices
- Write meaningful commit messages
- Comment complex logic

### Git Workflow
- Always work on your personal branch
- Create feature branches from your personal branch if needed
- Commit frequently with clear messages
- Pull latest changes before pushing
- Create PRs for review before merging to main

### Testing (iOS)
- Test on iOS Simulator (iPhone 13/14/15 recommended)
- Test on physical iPhone/iPad devices
- Test on different iOS versions (13.0+)
- Verify permissions (Location, Camera, Notifications)
- Use Expo Go app during development
- Test Firebase integration thoroughly
- Verify API endpoints with Postman/cURL

### iOS-Specific Considerations
- Use iOS design guidelines (Human Interface Guidelines)
- Test on different screen sizes (iPhone SE to iPad Pro)
- Handle iOS keyboard behavior
- Implement proper iOS navigation patterns
- Test offline functionality
- Verify push notifications on iOS

### Deployment
- Use EAS Build for iOS builds
- Configure App Store Connect
- Submit to App Store for review

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/refresh-token` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/nearby` - Get nearby challenges
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/complete` - Complete challenge

### Events
- `GET /api/events` - Get all events
- `GET /api/events/nearby` - Get nearby events
- `POST /api/events` - Create event
- `POST /api/events/:id/join` - Join event

---

## 🔐 Security

- Never commit `.env` files
- Store Firebase service account keys securely
- Use environment variables for all secrets
- Implement proper authentication middleware
- Validate all user inputs

---

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

1. Checkout your personal branch
2. Make your changes
3. Test thoroughly
4. Create a Pull Request
5. Get reviewed and approved
6. Merge to main

---


---

