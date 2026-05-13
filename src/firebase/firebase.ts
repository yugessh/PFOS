import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getFirebaseEnv, isFirebaseConfigComplete } from './config';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

/**
 * Initialize Firebase app safely. If required env vars are missing, initialization is skipped
 * and consumer functions return undefined. This prevents crashes in environments where
 * Firebase isn't configured (like CI or quick local runs without .env.local).
 */
export function initializeFirebase() {
  const env = getFirebaseEnv();
  if (!isFirebaseConfigComplete(env)) {
    // developer-friendly warning
    // eslint-disable-next-line no-console
    console.warn('Firebase configuration incomplete. Skipping Firebase initialization.\nSet NEXT_PUBLIC_FIREBASE_* variables in .env.local to enable Firebase.');
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp({
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      projectId: env.projectId,
      storageBucket: env.storageBucket,
      messagingSenderId: env.messagingSenderId,
      appId: env.appId,
      measurementId: env.measurementId,
    } as any);
    db = getFirestore(app);
    auth = getAuth(app);
  }

  return app;
}

export function getFirebaseAppSafe(): FirebaseApp | null {
  if (!app) initializeFirebase();
  return app ?? null;
}

export function getFirestoreSafe(): Firestore | null {
  if (!db) initializeFirebase();
  return db ?? null;
}

export function getAuthSafe(): Auth | null {
  if (!auth) initializeFirebase();
  return auth ?? null;
}
