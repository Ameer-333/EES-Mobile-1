
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let functionsInstance: Functions | undefined;

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
  console.error(
    `CRITICAL: Missing or invalid Firebase configuration for: ${missingOrInvalidConfigs.join(
      ', '
    )}. Please ensure these NEXT_PUBLIC_ environment variables are correctly set. Firebase services will be unavailable.`
  );
} else {
  try {
    console.log('Attempting to initialize Firebase with config:', firebaseConfigValues);
    app = getApps().length ? getApp() : initializeApp(firebaseConfigValues);

    if (!app || typeof app.name === 'undefined') {
      console.error('Firebase app object is invalid after initialization. Services will be unavailable.');
    } else {
      console.log('Firebase app initialized with effective config for project ID:', app.options.projectId);
      
      auth = getAuth(app);
      if (!auth || typeof auth.onAuthStateChanged !== 'function') {
        console.error('Firebase Auth service instance appears to be invalid after initialization. Auth will be unavailable.');
        auth = undefined;
      } else {
        console.log('Firebase Auth service initialized successfully.');
      }
      
      try {
        firestore = getFirestore(app);
        if (!firestore || typeof (firestore as any).collection !== 'function') {
           console.error("Firebase Firestore service instance appears to be invalid after initialization. Expected a Firestore client with a 'collection' method. This can happen if the database is in Datastore Mode instead of Native Mode.");
           firestore = undefined;
        } else {
          console.log('Firestore service initialized successfully.');
        }
      } catch (e: any) {
        console.error(`Firestore initialization failed specifically: ${e.message}. This can happen if the database is in Datastore Mode instead of Native Mode.`);
        firestore = undefined;
      }
      
      functionsInstance = getFunctions(app);
      if (!functionsInstance || typeof functionsInstance.app === 'undefined') {
        console.error('Firebase Functions service instance appears to be invalid after initialization. Functions will be unavailable.');
        functionsInstance = undefined;
      } else {
        console.log('Firebase Functions service initialized successfully.');
      }
    }
  } catch (e: any) {
    console.error(`A top-level Firebase initialization error occurred: ${e.message}. All Firebase services will be unavailable.`, e.stack);
    app = undefined;
    auth = undefined;
    firestore = undefined;
    functionsInstance = undefined;
  }
}

export { app, auth, firestore, functionsInstance as functions };
