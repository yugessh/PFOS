'use client';

import { Bell, Search, Settings } from 'lucide-react';
import ConnectionStatusBar from '@/src/components/connection-status/ConnectionStatusBar';
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

  return (
    <div className="hidden lg:flex h-16 bg-background border-b border-border items-center justify-between px-6 sticky top-0 z-30">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.28em] text-secondary">Neo Finance OS</p>
        <h2 className="text-xl font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden xl:block">
          <input
            type="search"
            placeholder="Search transactions, budgets..."
            className="input-surface pr-12 min-w-[320px]"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" />
        </div>

        <button className="button-ghost p-3 rounded-[20px]" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="button-ghost p-3 rounded-[20px]" aria-label="Settings">
          <Settings size={18} />
        </button>

        <div className="hidden xl:flex items-center gap-3 rounded-[22px] border border-border bg-card p-2 pl-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 grid place-items-center text-primary font-semibold">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Jamie Doe</p>
            <p className="text-xs text-secondary">Personal profile</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ConnectionStatusBar />
        </div>

        <div className="xl:hidden p-2 rounded-[20px] border border-border bg-card">
          <NotificationBadge />
        </div>
      </div>
    </div>
  );
}
