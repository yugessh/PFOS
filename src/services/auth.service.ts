import { getAuthSafe } from '@/src/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from 'firebase/auth';

export async function signUp(email: string, password: string): Promise<UserCredential> {
  const auth = getAuthSafe();
  if (!auth) throw new Error('Firebase Auth not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  const auth = getAuthSafe();
  if (!auth) throw new Error('Firebase Auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  const auth = getAuthSafe();
  if (!auth) return;
  return firebaseSignOut(auth);
}
