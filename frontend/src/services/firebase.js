import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase config
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Init Firebase app with error handling - make it async to prevent blocking
if (__DEV__) {
  console.log('🔥 Firebase: Starting initialization...');
}

let app;
let auth;
let db;
let storage;

// Initialize Firebase asynchronously to prevent blocking
const initFirebase = () => {
    try {
        console.log('🔥 Firebase: Config check - apiKey:', !!firebaseConfig.apiKey, 'projectId:', !!firebaseConfig.projectId);
        
        // Check if Firebase config is complete
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.warn('⚠️ Firebase config is incomplete. Check your .env file.');
            // Return null values but don't crash
            return { app: null, auth: null, db: null, storage: null };
        }
        
        console.log('🔥 Firebase: Initializing app...');
        try {
            // Check if app already exists
            const existingApps = getApps();
            if (existingApps.length > 0) {
                console.log('🔥 Firebase: Using existing app instance');
                app = existingApps[0];
            } else {
                app = initializeApp(firebaseConfig);
                console.log('🔥 Firebase: App initialized');
            }
        } catch (appError) {
            console.error('❌ Firebase: Error initializing app:', appError);
            throw appError;
        }
        
        // Init services (with persistence)
        console.log('🔥 Firebase: Initializing auth...');
        try {
            // Try to get existing auth first
            try {
                auth = getAuth(app);
                console.log('🔥 Firebase: Using existing auth instance');
            } catch (e) {
                // If getAuth fails, initialize new auth
                auth = initializeAuth(app, {
                    persistence: getReactNativePersistence(AsyncStorage),
                });
                console.log('🔥 Firebase: Auth initialized');
            }
        } catch (authError) {
            console.error('❌ Firebase: Error initializing auth:', authError);
            throw authError;
        }

        // 🔥 DEV ONLY – helps Expo Go with Recaptcha
        // Remove this before production!
        if (auth && auth.settings) {
            console.log('🔥 Firebase: Disabling app verification for testing');
            auth.settings.appVerificationDisabledForTesting = true;
        }

        console.log('🔥 Firebase: Initializing Firestore...');
        db = getFirestore(app);
        console.log('🔥 Firebase: Firestore initialized');
        
        console.log('🔥 Firebase: Initializing Storage...');
        storage = getStorage(app);
        console.log('🔥 Firebase: Storage initialized');
        
        console.log('✅ Firebase initialized successfully');
        return { app, auth, db, storage };
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        // Return null values but don't crash
        return { app: null, auth: null, db: null, storage: null };
    }
};

// Initialize immediately but handle errors gracefully
const firebaseInit = initFirebase();
app = firebaseInit.app;
auth = firebaseInit.auth;
db = firebaseInit.db;
storage = firebaseInit.storage;

export { app, auth, db, storage, firebaseConfig };
