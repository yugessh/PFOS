import { getFirestoreSafe } from '@/firebase/firebase';

/**
 * Legacy adapter used by services — returns Firestore instance or null.
 * Services should check for `null` and handle absence of Firebase gracefully
 * to avoid crashing the app when env vars are not set.
 */
export function getFirestoreClient() {
  const db = getFirestoreSafe();
  if (!db) {
    // eslint-disable-next-line no-console
    console.warn('Firestore not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set in .env.local');
    return null;
  }
  return db;
}
