const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// TODO: Replace with your actual Firebase Admin SDK configuration
// You can either use a service account key file or initialize with environment variables

let serviceAccount;
try {
  // Option 1: Using service account key file (for development)
  // serviceAccount = require('../serviceAccountKey.json');
  
  // Option 2: Using environment variables (recommended for production)
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  };
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error.message);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.log('⚠️  Please check your Firebase configuration');
  }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage,
};

