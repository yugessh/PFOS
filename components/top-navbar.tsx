'use client';

import { Bell, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConnectionStatusBar from '@/components/connection-status/ConnectionStatusBar';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { NotificationCenter } from '@/src/components/notifications/NotificationCenter';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, signOut } = useAuthContext();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const pageTitle = formatTitle(pathname);
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  const handleLogout = async () => {
    if (window.confirm('Logout?')) {
      await signOut();
    }
  };

  const initials = useMemo(() => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }

    return user?.email?.charAt(0).toUpperCase() || 'PF';
  }, [user?.displayName, user?.email]);

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
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-[rgba(8,10,15,0.86)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border border-border bg-[rgba(0,245,196,0.10)] text-sm font-semibold text-[#00F5C4] shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
              aria-label="Profile avatar"
            >
              {initials}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.38em] text-secondary">PFOS</p>
              <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {isDashboardRoute && pathname === '/dashboard' ? 'Dashboard' : pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-secondary transition hover:border-[#00F5C4]/40 hover:text-foreground"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-secondary transition hover:border-[#38BDF8]/40 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#00F5C4] px-1 text-[10px] font-semibold text-[#071a0d]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>

            <div className="hidden sm:block">
              <ConnectionStatusBar />
            </div>
          </div>
        </div>

        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </header>

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
