
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate essential Firebase configuration
const essentialKeys: (keyof typeof firebaseConfigValues)[] = ['apiKey', 'authDomain', 'projectId'];
const missingOrInvalidConfigs: string[] = [];

for (const key of essentialKeys) {
  const value = firebaseConfigValues[key];
  // Check if the value is undefined, null, an empty string, or the literal string "undefined"
  if (value === undefined || value === null || String(value).trim() === "" || String(value).trim().toLowerCase() === "undefined") {
    missingOrInvalidConfigs.push(key);
  }
}

if (missingOrInvalidConfigs.length > 0) {
  const errorMessage = `Critical Error: Missing or invalid Firebase configuration for: ${missingOrInvalidConfigs.join(', ')}. Please ensure these NEXT_PUBLIC_ environment variables are correctly set in your deployment environment and .env files. App cannot start.`;
  console.error(errorMessage);
  // This error will halt execution, which is important for server-side startup
  // or client-side if these vars are truly missing.
  throw new Error(errorMessage);
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functionsInstance: Functions;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfigValues);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  firestore = getFirestore(app);
  functionsInstance = getFunctions(app); // Initialize Functions

  // Additional check to ensure functionsInstance is usable
  if (!functionsInstance || typeof functionsInstance.app === 'undefined') {
      throw new Error("Firebase Functions service instance appears to be invalid after initialization.");
  }

} catch (e: any) {
  console.error("Firebase initialization failed:", e.message, e.stack);
  // Provide a more user-friendly error or re-throw if critical
  throw new Error(`Firebase initialization failed. Please check your Firebase configuration and environment variables. Original error: ${e.message}`);
}

export { app, auth, firestore, functionsInstance as functions };
