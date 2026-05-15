import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getSafeFirebaseConfig } from '@/src/lib/firebase-config';

// Safe initialization: only initialize Firebase when configuration is present
const safeConfig = getSafeFirebaseConfig();

let app: any = null;
let db: any = null;
let auth: any = null;

if (safeConfig) {
  app = initializeApp(safeConfig as any);
  db = getFirestore(app);
  auth = getAuth(app);

  // Connect to Firestore emulator in development when configured
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
    const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST.split(':');
    try {
      connectFirestoreEmulator(db, host, parseInt(port));
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
