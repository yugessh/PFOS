'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { TopNavbar } from '@/components/top-navbar';
import { BottomNav } from '@/components/bottom-nav';
import { useAuthContext } from '@/src/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <TopNavbar />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
