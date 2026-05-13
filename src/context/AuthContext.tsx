'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { AuthContextType, AuthState, User } from './types';
import { getSafeFirebaseConfig, FirebaseConfigError } from '../lib/firebase-config';

// Safe Firebase initialization
let app: any = null;
let auth: any = null;
let googleProvider: any = null;
let isFirebaseInitialized = false;

try {
  const firebaseConfig = getSafeFirebaseConfig();
  if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseInitialized = true;
  }
} catch (error) {
  if (error instanceof FirebaseConfigError) {
    console.error(error.message);
  } else {
    console.error('Firebase initialization failed:', error);
  }
}

const mapFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseInitialized) {
      setState({
        user: null,
        loading: false,
        initialized: true
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const user = mapFirebaseUser(firebaseUser);
      setState({
        user,
        loading: false,
        initialized: true
      });
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    
    try {
      setError(null);
      setState(prev => ({ ...prev, loading: true }));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUser(userCredential.user);
      
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    
    try {
      setError(null);
      setState(prev => ({ ...prev, loading: true }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUser(userCredential.user);
      
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    
    try {
      setError(null);
      setState(prev => ({ ...prev, loading: true }));
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = mapFirebaseUser(result.user);
      
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    
    try {
      setError(null);
      await firebaseSignOut(auth);
      setState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    ...state,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
