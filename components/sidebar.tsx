'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronLeft, ChevronRight, Bell, Settings, LogOut } from 'lucide-react';
import { useActiveRoute } from '@/hooks/use-active-route';
import { useAuthContext } from '@/src/context/AuthContext';
import { sidebarNavItems, analyticsNavItems, settingsNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function Sidebar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isActive } = useActiveRoute();
  const { user, signOut } = useAuthContext();
  const router = useRouter();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'PF';

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    setIsOpen(false);
    router.push('/auth/login');
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-bg-main px-4 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-2xl bg-card border border-border text-foreground hover:bg-card-elevated transition-all"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-semibold text-foreground">Neo Finance OS</h1>
        <Bell size={20} className="text-secondary" />
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-[260px] bg-bg-secondary border-r border-border transition-transform duration-300 lg:translate-x-0',
          isCollapsed ? 'lg:w-[88px]' : 'lg:w-[260px]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="hidden lg:flex items-center justify-between gap-3 border-b border-border px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-3xl grid place-items-center bg-[rgba(126,231,199,0.06)] text-accent-mint font-semibold">PF</div>
              <div className={cn('transition-opacity duration-300 ease-out', isCollapsed ? 'opacity-0 pointer-events-none select-none' : 'opacity-100')}>
                <h1 className="text-lg font-semibold text-foreground">Neo Finance OS</h1>
                <p className="text-xs uppercase tracking-[0.32em] text-secondary">Premium dashboard</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-2xl p-2 border border-border bg-card text-secondary hover:text-primary"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
            <nav className="px-4 py-4 space-y-6">
              <div>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Navigation</p>
                <div className="space-y-2">
                  {sidebarNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn('flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200', isCollapsed && 'justify-center px-0')}
                        onClick={() => setIsOpen(false)}
                        style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { color: 'var(--text-secondary)' }}
                      >
                        <div
                          className={cn('grid place-items-center h-10 w-10 rounded-2xl')}
                          style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { backgroundColor: 'var(--card)', color: 'var(--text-secondary)' }}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={cn('text-sm font-medium transition-opacity duration-200', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Analytics</p>
                <div className="space-y-2">
                  {analyticsNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn('flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200', isCollapsed && 'justify-center px-0')}
                        onClick={() => setIsOpen(false)}
                        style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { color: 'var(--text-secondary)' }}
                      >
                        <div
                          className={cn('grid place-items-center h-10 w-10 rounded-2xl')}
                          style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { backgroundColor: 'var(--card)', color: 'var(--text-secondary)' }}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={cn('text-sm font-medium transition-opacity duration-200', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          <div className="border-t border-border px-4 py-4">
            <div className="rounded-[24px] border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-3xl grid place-items-center bg-[rgba(126,231,199,0.08)] text-accent-mint font-semibold">{initials}</div>
                <div className={cn('transition-opacity duration-200', isCollapsed ? 'opacity-0 pointer-events-none select-none' : 'opacity-100')}>
                  <p className="text-sm font-semibold text-foreground">{user?.displayName || 'Premium User'}</p>
                  <p className="text-xs text-secondary truncate max-w-[130px]">{user?.email || 'account@email.com'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={18} />
                  <span className={cn('transition-opacity duration-200', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
                    Settings
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated hover:text-foreground"
                >
                  <LogOut size={18} />
                  <span className={cn('transition-opacity duration-200', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-semibold text-foreground">Sign out?</h2>
            <p className="mt-3 text-sm text-secondary">You will be returned to the login screen and your session will be cleared.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-[20px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-[20px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
