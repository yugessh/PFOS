'use client';

import { useAuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthLayout({ children, requireAuth = false, redirectTo = '/auth/login' }: AuthLayoutProps) {
  const { user, loading, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
    }
    
    if (!requireAuth && user) {
      router.push('/dashboard/protected-example');
    }
  }, [user, loading, initialized, requireAuth, router, redirectTo]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect
  }

  if (!requireAuth && user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
