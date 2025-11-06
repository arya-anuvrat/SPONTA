# SPONTA Setup Guide

This guide will walk you through setting up the SPONTA project from scratch.

---

## 📋 Prerequisites (iOS Development)

Before you begin, ensure you have the following installed:

1. **macOS** (required for iOS development)
   - iOS development requires macOS

2. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

4. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

5. **Xcode** (for iOS Simulator - optional but recommended)
   - Download from Mac App Store
   - Required for iOS Simulator testing
   - Verify: `xcode-select --version`

6. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

7. **Firebase Account**
   - Sign up at [firebase.google.com](https://firebase.google.com/)

8. **Expo Go App** (for iOS testing)
   - Install from [App Store](https://apps.apple.com/app/expo-go/id982107779)

9. **Apple Developer Account** (optional, for App Store deployment)
   - Sign up at [developer.apple.com](https://developer.apple.com/)

---

## 🔧 Step 1: Clone Repository and Setup Branches

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arya-anuvrat/SPONTA.git
   cd SPONTA
   ```

2. **Check available branches:**
   ```bash
   git branch -a
   ```

3. **Switch to your personal branch:**
   ```bash
   # For Anuvrat
   git checkout anuvrat
   
   # For Arnav
   git checkout arnav
   
   # For Sukrit
   git checkout sukrit
   
   # For Suraj
   git checkout suraj
   ```

4. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

---

## 🔥 Step 2: Firebase Project Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: **SPONTA**
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Phone** authentication:
   - Click on "Phone"
   - Enable it
   - Save

### 2.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to you
5. Click "Enable"

### 2.4 Enable Cloud Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode** (for development)
4. Select same location as Firestore
5. Click "Done"

### 2.5 Add iOS App (Required)

1. In Firebase Console, click the gear icon → **Project settings**
2. Under "Your apps", click **iOS** icon (`🍎`)
3. iOS bundle ID: `com.sponta.app`
4. App nickname: "SPONTA iOS"
5. App Store ID: (leave blank for now, add when published)
6. Click "Register app"
7. Download `GoogleService-Info.plist`
8. **Save this file** - you'll need it when building native iOS app

### 2.6 Web App Configuration (for React Native)

1. Click **Web** icon (`</>`)
2. Register app name: "SPONTA Web"
3. Copy the Firebase configuration object
4. You'll need these values for frontend `.env`

### 2.7 Generate Service Account Key (Backend)

1. Go to **Project settings** → **Service accounts**
2. Click "Generate new private key"
3. Click "Generate key"
4. Save the JSON file as `serviceAccountKey.json` in `backend/` folder
5. **⚠️ IMPORTANT:** Add `serviceAccountKey.json` to `.gitignore` (already done)

---

## 🎨 Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Firebase

1. Create `.env` file in `frontend/` directory:
   ```bash
   touch .env
   ```

2. Add Firebase configuration (from Step 2.7):
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

3. Update `src/services/firebase.js` with actual values (or use environment variables)

### 3.3 Configure app.json

1. The `app.json` is already configured with basic settings
2. Update `bundleIdentifier`/`package` if needed
3. Update `scheme` if you want a custom URL scheme

### 3.4 Start Development Server (iOS)

```bash
npm run ios              # Opens iOS Simulator
# OR
npm start                # Then press 'i' to open iOS Simulator
```

This will:
- Start the Expo development server
- Show a QR code in terminal
- Open Expo DevTools in browser
- Optionally launch iOS Simulator

### 3.5 Run on iOS Device

1. **Using Expo Go:**
   - Open Expo Go app on iPhone/iPad
   - Scan QR code from terminal
   - Ensure phone and computer are on same WiFi network

2. **Using iOS Simulator:**
   - Press `i` in terminal after `npm start`
   - Or use: `npm run ios`
   - Ensure Xcode is installed for Simulator

---

## 🖥️ Step 4: Backend Setup

### 4.1 Install Dependencies

```bash
cd backend
npm install
```

### 4.2 Configure Environment Variables

1. Create `.env` file in `backend/` directory:
   ```bash
   touch .env
   ```

2. Add configuration:
   ```env
   PORT=3000
   
   # Firebase Admin SDK (from serviceAccountKey.json)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Environment
   NODE_ENV=development
   ```

   **Alternative:** If you prefer using the service account key file:
   - Place `serviceAccountKey.json` in `backend/` folder
   - Update `src/config/firebase.js` to use the file instead

### 4.3 Start Backend Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 4.4 Test Backend

Open browser or use curl:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SPONTA API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ✅ Step 5: Verify Setup (iOS)

### Frontend
- [ ] Expo server starts without errors
- [ ] App opens in iOS Simulator or Expo Go
- [ ] Landing screen displays correctly
- [ ] Navigation works between screens
- [ ] iOS permissions prompt correctly (Location, Camera)

### Backend
- [ ] Server starts on port 3000
- [ ] Health check endpoint returns OK
- [ ] No Firebase initialization errors

### Firebase (iOS)
- [ ] iOS app registered in Firebase Console
- [ ] Authentication is enabled
- [ ] Firestore database is created
- [ ] Storage is enabled
- [ ] `GoogleService-Info.plist` downloaded
- [ ] Service account key is configured

---

## 🚨 Troubleshooting (iOS)

### iOS-Specific Issues

**"Unable to resolve module" errors:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**iOS Simulator not opening:**
- Ensure Xcode is installed
- Try: `xcrun simctl list devices` to see available simulators
- Restart Expo: `npm start -- --clear`

**Expo Go connection issues:**
- Ensure iPhone and Mac are on same WiFi network
- Try using tunnel mode: `expo start --tunnel`
- Check firewall settings on Mac

**Firebase Phone Auth on iOS:**
- Verify bundle ID matches Firebase iOS app configuration
- Check that Phone Auth is enabled in Firebase Console
- Ensure URL scheme is configured in `app.json`

**iOS Permissions not working:**
- Verify `infoPlist` entries in `app.json`
- Check that Expo plugins are properly configured
- Restart Expo server after changing permissions

**Firebase errors:**
- Verify `.env` file exists and has correct values
- Check Firebase config in `src/services/firebase.js`
- Ensure iOS app is registered in Firebase Console

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Firebase Admin SDK errors:**
- Verify `.env` file has all required variables
- Check service account key file permissions
- Ensure Firebase project ID is correct

**Database connection errors:**
- Verify Firestore is enabled in Firebase Console
- Check database rules allow read/write (for development)

---

## 📝 Next Steps

1. ✅ Complete setup verification
2. 🔐 Implement authentication flow
3. 📱 Build onboarding screens
4. 🎯 Create challenge system
5. 👥 Add social features

---

## 🔄 Updating Dependencies

### Frontend
```bash
cd frontend
npm update
```

### Backend
```bash
cd backend
npm update
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo iOS Development](https://docs.expo.dev/guides/ios/)
- [Firebase iOS Setup Guide](https://firebase.google.com/docs/ios/setup)
- [React Navigation iOS](https://reactnavigation.org/docs/getting-started)
- [Express.js Guide](https://expressjs.com/en/starter/installing.html)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [EAS Build for iOS](https://docs.expo.dev/build/introduction/)

---

**Setup complete! 🎉 Start building amazing features!**

