import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { validateFirebaseConfig, getSafeFirebaseConfig, FirebaseConfigError } from '@/src/lib/firebase-config';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

const createFirestore = (firebaseApp: FirebaseApp): Firestore => {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.warn('Firestore initialization with persistent cache failed:', message);
    return getFirestore(firebaseApp);
  }
};

/**
 * Initialize Firebase app safely using the centralized validator in `src/lib/firebase-config`.
 * If required env vars are missing, initialization is skipped and consumer functions return null.
 * This prevents crashes when `getAuth()` or `getFirestore()` would otherwise be called with
 * an invalid/empty configuration (which causes auth/invalid-api-key).
 */
export function initializeFirebase() {
  if (app && db && auth) {
    return app;
  }

  let cfg = getSafeFirebaseConfig();
  if (!cfg) {
    try {
      validateFirebaseConfig();
    } catch (error) {
      if (error instanceof FirebaseConfigError) {
        // eslint-disable-next-line no-console
        console.error(error.message);
      }
    }
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp(cfg as any);
  } else {
    app = getApp();
  }

  if (!db && app) {
    db = createFirestore(app);
  }

  if (!auth && app) {
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
