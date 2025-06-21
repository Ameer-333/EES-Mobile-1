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

// Validate essential environment variables
const essentialKeys: (keyof typeof firebaseConfigValues)[] = ['apiKey', 'authDomain', 'projectId'];
const missingOrInvalidConfigs: string[] = [];

for (const key of essentialKeys) {
  const value = firebaseConfigValues[key];
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === '' ||
    String(value).trim().toLowerCase() === 'undefined'
  ) {
    missingOrInvalidConfigs.push(key);
  }
}

if (missingOrInvalidConfigs.length > 0) {
  const errorMessage = `Critical Error: Missing or invalid Firebase configuration for: ${missingOrInvalidConfigs.join(
    ', '
  )}. Please ensure these NEXT_PUBLIC_ environment variables are correctly set in your deployment environment and .env files. App cannot start.`;
  console.error(errorMessage, 'Current config values:', firebaseConfigValues);
  throw new Error(errorMessage);
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functionsInstance: Functions;

try {
  console.log('Attempting to initialize Firebase with config:', firebaseConfigValues);

  if (!getApps().length) {
    app = initializeApp(firebaseConfigValues);
  } else {
    app = getApp();
  }

  if (!app || typeof app.name === 'undefined') {
    throw new Error(
      'Firebase app object is invalid after initialization. Check NEXT_PUBLIC_ environment variables.'
    );
  }
  console.log('Firebase app initialized with effective config for project ID:', app.options.projectId);

  auth = getAuth(app);
  if (!auth || typeof auth.onAuthStateChanged !== 'function') {
    throw new Error('Firebase Auth service instance appears to be invalid after initialization.');
  }
  console.log('Firebase Auth service initialized successfully.');

  try {
    firestore = getFirestore(app);
    if (!firestore || typeof firestore !== 'object') {
      throw new Error('Firestore instance is invalid.');
    }
    console.log('Firestore service initialized successfully.');
  } catch (e: any) {
    console.error('CRITICAL: getFirestore(app) failed.', e);
    throw new Error(`Firestore initialization failed specifically: ${e.message}`);
  }

  functionsInstance = getFunctions(app);
  if (!functionsInstance || typeof functionsInstance.app === 'undefined') {
    throw new Error('Firebase Functions service instance appears to be invalid after initialization.');
  }
  console.log('Firebase Functions service initialized successfully.');
} catch (e: any) {
  console.error('Firebase initialization failed:', e.message, e.stack);
  throw new Error(
    `Firebase initialization failed. Please check your Firebase configuration and environment variables. Original error: ${e.message}`
  );
}

export { app, auth, firestore, functionsInstance as functions };
