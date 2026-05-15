import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getSafeFirebaseConfig } from '@/src/lib/firebase-config';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

/**
 * Initialize Firebase app safely using the centralized validator in `src/lib/firebase-config`.
 * If required env vars are missing, initialization is skipped and consumer functions return null.
 * This prevents crashes when `getAuth()` or `getFirestore()` would otherwise be called with
 * an invalid/empty configuration (which causes auth/invalid-api-key).
 */
export function initializeFirebase() {
  const cfg = getSafeFirebaseConfig();
  if (!cfg) {
    // eslint-disable-next-line no-console
    console.warn('Firebase config missing - skipping initializeApp. Add NEXT_PUBLIC_FIREBASE_* to .env.local');
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp(cfg as any);
    try {
      db = getFirestore(app);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn('getFirestore failed during initialization:', message);
      db = undefined;
    }
    try {
      auth = getAuth(app);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn('getAuth failed during initialization:', message);
      auth = undefined;
    }
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
