'use client';

import { Settings } from 'lucide-react';
import { useAuthContext } from '@/src/context/AuthContext';
import { NotificationBadge } from '@/src/components/notifications/NotificationBadge';

export function TopNavbar() {
  const { user, signOut } = useAuthContext();

  return (
    <div className="hidden lg:flex h-12 bg-background border-b border-border items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <NotificationBadge />
        </div>
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <Settings size={18} className="text-muted-foreground" />
        </div>

        {user ? (
          <button
            onClick={() => void signOut()}
            className="px-3 py-1 text-xs rounded-md bg-muted text-foreground hover:opacity-90"
          >
            Sign out
          </button>
        ) : (
          <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <a href="/auth/login" className="text-xs text-muted-foreground">Sign in</a>
          </div>
        )}
      </div>
    </div>
  );
}
