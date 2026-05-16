'use client';

import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import ConnectionStatusBar from '@/components/connection-status/ConnectionStatusBar';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { NotificationBadge } from '@/src/components/notifications/NotificationBadge';
import { GlobalSearchDialog } from '@/components/global-search-dialog';

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
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Global keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="hidden lg:flex items-center justify-between gap-4 rounded-[32px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] sticky top-4 z-20 mx-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-secondary">Neo Finance OS</p>
        <h2 className="text-2xl font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="relative hidden xl:flex items-center gap-2 min-w-[320px] px-4 py-2 rounded-[22px] border border-border bg-card-elevated hover:border-accent-mint/50 transition-colors"
          aria-label="Search (Cmd+K)"
        >
          <Search size={18} className="text-secondary" />
          <span className="flex-1 text-left text-sm text-secondary">
            Search transactions, accounts...
          </span>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-card border border-border">
            ⌘K
          </span>
        </button>

        <button className="button-ghost p-3 rounded-[22px] xl:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search size={18} className="text-secondary" />
        </button>

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

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
