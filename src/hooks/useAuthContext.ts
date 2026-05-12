'use client';

import { useAuthContext } from '../context/AuthContext';

// Re-export the useAuthContext hook for cleaner imports
export { useAuthContext };

// Additional convenience hooks can be added here
export function useAuth() {
  return useAuthContext();
}

export function useUser() {
  const { user, loading, initialized } = useAuthContext();
  return { user, loading, initialized };
}

export function useAuthActions() {
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    clearError 
  } = useAuthContext();
  
  return { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    clearError 
  };
}
