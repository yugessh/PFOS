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
    return res.user;
  };

  const signIn = async (email: string, password: string) => {
    const auth = getAuthSafe();
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(mapFirebaseUser(res.user));
    return res.user;
  };

  const signInWithGoogle = async () => {
    const auth = getAuthSafe();
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    setUser(mapFirebaseUser(res.user));
    return res.user;
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

