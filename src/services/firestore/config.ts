import { connectFirestoreEmulator } from 'firebase/firestore';
import { initializeFirebase, getFirebaseAppSafe, getFirestoreSafe, getAuthSafe } from '@/src/firebase/firebase';

initializeFirebase();

const app = getFirebaseAppSafe();
const db = getFirestoreSafe();
const auth = getAuthSafe();

if (app && db) {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
    const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST.split(':');
    try {
      connectFirestoreEmulator(db, host, parseInt(port, 10));
      // eslint-disable-next-line no-console
      console.log('Connected to Firestore emulator at:', host, port);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.warn('Failed to connect to Firestore emulator:', message);
    }
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firestore not initialized: missing NEXT_PUBLIC_FIREBASE_* environment variables. See src/lib/firebase-config.ts for setup.');
}

export { app };
export { db };
export { auth };
