# Google Sign-In Setup Guide

This guide will walk you through setting up Google OAuth for your Sponta app.

## What You Need

For Google Sign-In to work, you need **OAuth 2.0 Client IDs** from Google Cloud Console. You'll need:

1. **Web Client ID** (required for Expo/React Native)
2. **iOS Client ID** (optional, for iOS builds)
3. **Android Client ID** (optional, for Android builds)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Sponta` (or your preferred name)
4. Click **"Create"**

### 2. Enable Google Identity Services API (Optional - May Not Be Required)

**Good news:** For Firebase Google Sign-In, you typically **don't need to enable a specific API** anymore! Firebase handles the OAuth flow automatically.

However, if you want to be thorough or if you encounter issues:

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Identity Toolkit API"** (this is the modern name)
   - If you see "Identity Toolkit API" in results, click it and enable it
   - This API lets you "use open standards to verify a user's identity"
3. **OR** search for **"Google+ API"** (older name, may be deprecated)
4. Click **"Enable"** if you find it

**Most likely:** You can skip this step and go directly to Step 3 (OAuth Consent Screen). Firebase will handle the API requirements automatically.

### 3. Configure OAuth Consent Screen

**EXACT LOCATION:**
1. In Google Cloud Console, look at the **LEFT SIDEBAR**
2. Find **"APIs & Services"** (it's a main menu item)
3. Click on **"APIs & Services"** to expand it
4. In the submenu, click **"OAuth consent screen"**

**If you don't see it:**
- Make sure you're in the correct project (top bar should show "Sponta")
- Look for a hamburger menu (☰) if sidebar is collapsed
- The menu path is: **APIs & Services → OAuth consent screen**

**Configuration:**
1. Choose **"External"** (unless you have a Google Workspace)
2. Fill in the required fields:
   - **App name**: `Sponta`
   - **User support email**: Your email
   - **Developer contact information**: Your email
3. Click **"Save and Continue"**
4. On **"Scopes"** page, click **"Save and Continue"** (default scopes are fine)
5. On **"Test users"** page, add your email if needed, then **"Save and Continue"**
6. Review and **"Back to Dashboard"**

### 4. Create OAuth 2.0 Client IDs

#### 4a. Web Client ID (REQUIRED)

**IMPORTANT:** Even though this is a mobile app, you MUST use **"Web application"** OAuth Client ID! This is because:
- Expo Go uses web-based OAuth flows
- Firebase Auth for React Native uses web credentials
- This is the standard way for Expo/React Native apps

**EXACT LOCATION:**
1. In Google Cloud Console, go to **LEFT SIDEBAR**
2. Click **"APIs & Services"** → **"Credentials"** (same menu as OAuth consent screen)
3. At the top of the Credentials page, you'll see a blue button: **"+ CREATE CREDENTIALS"**
4. Click it, then select **"OAuth client ID"** from the dropdown

**Configuration:**
1. Select **"Web application"** as the application type ← YES, even for mobile!
2. Name it: `Sponta Web Client`
3. **Authorized JavaScript origins**: Click "ADD URI" and add:
   - `https://auth.expo.io`
   - `https://accounts.google.com`
4. **Authorized redirect URIs**: Click "ADD URI" and add:
   - `https://auth.expo.io/@anonymous/sponta`
   - (For Expo Go, use `@anonymous`. For development builds, use your Expo username)
5. Click **"Create"**
6. A popup will show your Client ID - **COPY IT NOW** (you won't see it again!)
7. This is your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

**Note:** Don't create iOS or Android Client IDs unless you're building native development builds. For Expo Go, the Web Client ID is what you need!

#### 4b. iOS Client ID (Optional - for iOS builds)

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"iOS"**
3. Name it: `Sponta iOS Client`
4. **Bundle ID**: `com.sponta.app` (or your app's bundle ID from `app.json`)
5. Click **"Create"**
6. **Copy the Client ID** - this is your `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

#### 4c. Android Client ID (Optional - for Android builds)

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"Android"**
3. Name it: `Sponta Android Client`
4. **Package name**: `com.sponta.app` (or your app's package name from `app.json`)
5. **SHA-1 certificate fingerprint**: 
   - For development: Get from `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - For production: Get from your production keystore
6. Click **"Create"**
7. **Copy the Client ID** - this is your `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### 5. Add to Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **"Authentication"** → **"Sign-in method"**
4. Click on **"Google"**
5. Enable it
6. Enter your **Web Client ID** from step 4a
7. Enter your **Web Client Secret** (from the same OAuth client)
8. Click **"Save"**

### 6. Add to Frontend .env File

1. Open `frontend/.env` file (create it if it doesn't exist)
2. Add your Client IDs:

```env
# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id-here.apps.googleusercontent.com
```

**Minimum requirement**: You MUST have at least `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for it to work.

### 7. Update app.json (if needed)

Check that your `app.json` has the correct bundle identifier:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.sponta.app"
    },
    "android": {
      "package": "com.sponta.app"
    }
  }
}
```

### 8. Restart Expo

After adding the environment variables:

```bash
cd frontend
# Stop Expo if running (Ctrl+C)
# Clear cache
rm -rf node_modules/.cache .expo
# Restart
npx expo start --clear
```

## Testing

1. Open the app
2. Go to **"Create Account"** or **"Sign In"**
3. Click **"Continue with Google"**
4. You should see Google sign-in popup
5. Select your Google account
6. Grant permissions
7. You should be signed in!

## Troubleshooting

### "Google Sign-In is not configured"
- Check that `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is in your `.env` file
- Make sure you restarted Expo after adding the env variable
- Check that the variable name is exactly `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### "Failed to get Google ID token"
- Check that your OAuth consent screen is published (or you're a test user)
- Verify the redirect URIs match exactly
- Make sure Google+ API is enabled

### "Invalid client" error
- Double-check your Client IDs are correct
- Make sure you're using the Web Client ID (not iOS/Android) for Expo Go
- Verify the bundle ID/package name matches in app.json and Google Cloud Console

### Sign-in works but then fails
- Check Firebase Authentication is enabled for Google
- Verify the Web Client ID in Firebase matches your Google Cloud Console

## Quick Reference

**Minimum Setup (Expo Go):**
- ✅ Web Client ID in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- ✅ Google+ API enabled
- ✅ OAuth consent screen configured
- ✅ Firebase Google auth enabled

**Full Setup (Development Builds):**
- ✅ All of the above
- ✅ iOS Client ID (for iOS builds)
- ✅ Android Client ID (for Android builds)
- ✅ Correct bundle IDs in app.json

## Need Help?

If you're stuck:
1. Check the terminal logs for specific error messages
2. Verify all Client IDs are correct
3. Make sure you restarted Expo after adding env variables
4. Check Firebase Console → Authentication → Sign-in method → Google is enabled

