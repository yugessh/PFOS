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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0 pb-16 lg:pb-0">
        <TopNavbar />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
