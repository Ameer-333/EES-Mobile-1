
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check for essential Firebase config variables
const essentialConfigs: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
const missingConfigs = essentialConfigs.filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
  const errorMessage = `Missing Firebase configuration: ${missingConfigs.join(', ')}. Please ensure these environment variables are set in your .env file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY).`;
  console.error(errorMessage);
  // Throwing an error here will stop further execution if config is missing.
  // For a client-side error, this might not be caught as easily as a console log,
  // but it makes the issue clear during development.
  if (typeof window !== 'undefined') {
    // If on client-side, can show an alert or render an error message
    // For now, just log and throw to make it visible in dev console.
  }
  throw new Error(errorMessage);
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);

export { app, auth, firestore };
