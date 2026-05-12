'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import { ProtectedRouteProps } from '../../context/types';

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (initialized && !loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, initialized, router, redirectTo]);

  // Show loading screen while initializing or loading
  if (!initialized || loading) {
    return <AuthLoadingScreen />;
  }

  // If not authenticated, don't render children (will redirect)
  if (!user) {
    return <AuthLoadingScreen />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect away from auth pages
    if (initialized && !loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, initialized, router, redirectTo]);

  // Show loading screen while initializing or loading
  if (!initialized || loading) {
    return <AuthLoadingScreen />;
  }

  // If authenticated, don't render children (will redirect)
  if (user) {
    return <AuthLoadingScreen />;
  }

  // User is not authenticated, render children
  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading...
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Setting up your secure session
        </p>
      </div>
    </div>
  );
}
