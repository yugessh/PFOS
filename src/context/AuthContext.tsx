"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getAuthSafe, initializeFirebase } from '@/src/firebase/firebase';
import { ensureUserProfile } from '@/src/lib/firestore-init';

type AuthUser = {
  uid: string;
  email?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error?: string | null;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseUser(u: FirebaseUser | null): AuthUser | null {
  if (!u) return null;
  return { uid: u.uid, email: u.email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure firebase app is initialized on the client
    initializeFirebase();
    const auth = getAuthSafe();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Ensure persistent sessions
    void setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(mapFirebaseUser(u));
      setLoading(false);
    }, (e) => {
      setError(e?.message || String(e));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signUp = async (email: string, password: string) => {
    const auth = getAuthSafe();
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(mapFirebaseUser(res.user));

    // Initialize user profile and default collections in Firestore
    try {
      await ensureUserProfile(res.user.uid, {
        email: res.user.email || email,
        displayName: res.user.displayName || undefined,
      });
    } catch (initError) {
      console.error('Failed to initialize user profile after signup:', initError);
      // Don't throw - user is authenticated even if profile init failed
    }

    return res.user;
  };

  const signIn = async (email: string, password: string) => {
    const auth = getAuthSafe();
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(mapFirebaseUser(res.user));

    // Ensure user profile exists (for existing users)
    try {
      await ensureUserProfile(res.user.uid, {
        email: res.user.email || email,
        displayName: res.user.displayName || undefined,
      });
    } catch (initError) {
      console.error('Failed to ensure user profile on signin:', initError);
      // Don't throw - user is authenticated even if profile init failed
    }

    return res.user;
  };

  const signInWithGoogle = async () => {
    const auth = getAuthSafe();
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const res = await signInWithPopup(auth, provider);
      setUser(mapFirebaseUser(res.user));

      // Initialize user profile for Google signin
      try {
        await ensureUserProfile(res.user.uid, {
          email: res.user.email || '',
          displayName: res.user.displayName || undefined,
        });
      } catch (initError) {
        console.error('Failed to initialize user profile after Google signin:', initError);
        // Don't throw - user is authenticated even if profile init failed
      }

      return res.user;
    } catch (err: any) {
      // Handle popup closed, network errors, etc.
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (err?.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site.');
      } else if (err?.code === 'auth/operation-not-supported-in-this-environment') {
        throw new Error('Google sign-in is not available in this browser.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    const auth = getAuthSafe();
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
    setUser(null);
    // after signout, redirect to login
    try {
      router.push('/auth/login');
    } catch (_) {}
  };

  const value = useMemo(() => ({ user, loading, error, signUp, signIn, signInWithGoogle, signOut }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;

