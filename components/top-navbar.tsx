'use client';

import { Settings } from 'lucide-react';
import { useAuthContext } from '@/src/context/AuthContext';
import { NotificationBadge } from '@/src/components/notifications/NotificationBadge';

export function TopNavbar() {
  const { user, signOut } = useAuthContext();

  return (
    <div className="hidden lg:flex h-16 bg-background border-b border-border items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <NotificationBadge />
        </div>
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <Settings size={20} className="text-muted-foreground" />
        </div>

        {user ? (
          <button
            onClick={() => void signOut()}
            className="px-3 py-1 text-sm rounded-md bg-muted text-foreground hover:opacity-90"
          >
            Sign out
          </button>
        ) : (
          <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <a href="/auth/login" className="text-sm text-muted-foreground">Sign in</a>
          </div>
        )}
      </div>
    </div>
  );
}
