/**
 * Google Sign-In Service using Firebase and Expo Auth Session
 * 
 * Note: This file exports a hook (useGoogleAuth) that must be used inside React components.
 * For non-hook usage, use the signInWithGoogleAsync function instead.
 */
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

/**
 * React Hook: Initialize Google sign-in
 * Must be called at the top level of a React component
 * @returns {Object} { request, response, promptAsync }
 */
export const useGoogleAuth = () => {
  try {
    // Check if Google auth is configured
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    
    const hasConfig = !!(iosClientId || androidClientId || webClientId);

    // Only initialize if we have at least one client ID
    // Otherwise return safe defaults
    if (!hasConfig) {
      if (__DEV__) {
        console.log('🔵 Google Auth: Not configured, using defaults');
      }
      return {
        request: null,
        response: null,
        promptAsync: async () => ({ type: "dismiss" }),
      };
    }

    // Initialize Google auth request hook with available client IDs
    // Build config object only with defined values
    const config = {};
    if (iosClientId) config.iosClientId = iosClientId;
    if (androidClientId) config.androidClientId = androidClientId;
    if (webClientId) config.webClientId = webClientId;
    
    if (__DEV__) {
      console.log('🔵 Google Auth: Initializing with config');
    }
    
    const [request, response, promptAsync] = Google.useAuthRequest(config);

    return { 
      request, 
      response, 
      promptAsync: promptAsync || (async () => ({ type: "dismiss" })) 
    };
  } catch (error) {
    console.error('❌ Google Auth: Error initializing:', error);
    // Return safe defaults on error
    return {
      request: null,
      response: null,
      promptAsync: async () => ({ type: "dismiss" }),
    };
  }
};

/**
 * Sign in with Google
 * @param {Function} promptAsync - Function to prompt Google sign-in
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async (promptAsync) => {
  try {
    if (!promptAsync || typeof promptAsync !== "function") {
      throw new Error("Google sign-in is not properly configured. Please check your Google OAuth credentials.");
    }

    // Prompt user to sign in with Google
    const result = await promptAsync();
    
    if (result.type !== "success") {
      if (result.type === "cancel" || result.type === "dismiss") {
        throw new Error("Google sign-in was cancelled");
      }
      throw new Error(`Google sign-in failed: ${result.type}`);
    }

    // Get ID token from Google response
    const { id_token, access_token } = result.params || {};
    
    if (!id_token) {
      // Try to get token from access_token if id_token is not available
      if (access_token) {
        console.warn("Got access_token but not id_token, trying alternative method");
      }
      throw new Error("Failed to get Google ID token. Please try again.");
    }

    // Create Firebase credential using id_token
    const credential = GoogleAuthProvider.credential(id_token);
    
    if (!credential) {
      throw new Error("Failed to create Firebase credential from Google token");
    }
    
    // Sign in to Firebase with Google credential
    const userCredential = await signInWithCredential(auth, credential);
    
    if (!userCredential || !userCredential.user) {
      throw new Error("Failed to sign in with Google. Please try again.");
    }
    
    return userCredential;
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Provide more helpful error messages
    if (error.message?.includes("cancelled") || error.message?.includes("dismiss")) {
      throw error; // Don't show error for user cancellation
    }
    if (error.message?.includes("not properly configured")) {
      throw new Error("Google Sign-In is not configured. Please add Google OAuth credentials to your .env file.");
    }
    throw error;
  }
};

/**
 * Check if Google sign-in is configured
 * @returns {boolean}
 */
export const isGoogleAuthConfigured = () => {
  return !!(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  );
};

