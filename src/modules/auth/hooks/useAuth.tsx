'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, AuthState, AuthCredentials } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    });

    // Set initial user if available
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setAuthState(prev => ({
        ...prev,
        user: currentUser,
        loading: false
      }));
    }

    return unsubscribe;
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signIn(credentials);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as any }));
      throw error;
    }
  };

  const signUp = async (credentials: AuthCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signUp(credentials);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as any }));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signInWithGoogle();
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as any }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await authService.signOut();
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as any }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as any }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
