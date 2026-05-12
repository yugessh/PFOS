'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNavbar } from '@/components/top-navbar';
import { BottomNav } from '@/components/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
