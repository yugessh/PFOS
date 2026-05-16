'use client';

import { Bell, Search, Settings, LogOut } from 'lucide-react';
import ConnectionStatusBar from '@/components/connection-status/ConnectionStatusBar';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { NotificationBadge } from '@/src/components/notifications/NotificationBadge';

function formatTitle(pathname: string | null) {
  if (!pathname) return 'Dashboard';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const last = segments[segments.length - 1];
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function TopNavbar() {
  const { user, signOut } = useAuthContext();
  const pathname = usePathname();
  const pageTitle = formatTitle(pathname);

  const handleLogout = async () => {
    if (window.confirm('Logout?')) {
      await signOut();
    }
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'PF';

  return (
    <header className="hidden lg:flex items-center justify-between gap-4 rounded-[32px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] sticky top-4 z-20 mx-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-secondary">Neo Finance OS</p>
        <h2 className="text-2xl font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden xl:block">
          <input
            type="search"
            placeholder="Search transactions, budgets..."
            className="input-surface min-w-[320px] pr-12"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" />
        </div>

        <button className="button-ghost p-3 rounded-[22px]" aria-label="Notifications">
          <Bell size={18} className="text-secondary" />
        </button>
        <button className="button-ghost p-3 rounded-[22px]" aria-label="Settings">
          <Settings size={18} className="text-secondary" />
        </button>

        <button
          type="button"
          className="hidden xl:flex items-center gap-3 rounded-[26px] border border-border bg-bg-secondary px-4 py-3"
          onClick={handleLogout}
        >
          <div className="h-11 w-11 rounded-full bg-[rgba(126,231,199,0.14)] grid place-items-center text-accent-mint font-semibold">{initials}</div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{user?.displayName || 'User'}</p>
            <p className="text-xs text-secondary">Sign out</p>
          </div>
          <LogOut size={16} className="text-secondary" />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <ConnectionStatusBar />
        </div>

        <div className="xl:hidden p-2 rounded-[20px] border border-border bg-card">
          <NotificationBadge />
        </div>
      </div>
    </header>
  );
}
