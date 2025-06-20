
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions'; // Added

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const essentialConfigs: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
const missingConfigs = essentialConfigs.filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
  const errorMessage = `Missing Firebase configuration: ${missingConfigs.join(', ')}. Please ensure these environment variables are set in your .env file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY).`;
  console.error(errorMessage);
  if (typeof window !== 'undefined') {
  }
  throw new Error(errorMessage);
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functionsInstance: Functions; // Renamed to avoid conflict with imported 'functions'

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);
functionsInstance = getFunctions(app); // Initialize Functions

export { app, auth, firestore, functionsInstance as functions }; // Export as 'functions'
