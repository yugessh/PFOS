'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useActiveRoute } from '@/hooks/use-active-route';
import { sidebarNavItems, analyticsNavItems, settingsNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isActive } = useActiveRoute();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border flex items-center justify-between px-4 z-40" style={{ backgroundColor: 'var(--bg-main)' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-2xl bg-card border border-border text-foreground hover:bg-card-elevated transition-all"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Neo Finance OS</h1>
        <Bell size={20} className="text-secondary" />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-40 transition-all duration-300 lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]',
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[260px]',
          className,
        )}
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <div className="hidden lg:flex items-center justify-between gap-3 border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-3xl grid place-items-center text-primary font-semibold" style={{ backgroundColor: 'rgba(126,231,199,0.06)', color: 'var(--accent-mint)' }}>PF</div>
            <div
              className={cn(
                'transition-opacity duration-300 ease-out',
                isCollapsed ? 'opacity-0 pointer-events-none select-none' : 'opacity-100',
              )}
            >
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Neo Finance OS</h1>
              <p className="text-xs uppercase tracking-[0.32em]" style={{ color: 'var(--text-secondary)' }}>Premium dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-2xl p-2"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="p-4 mt-16 lg:mt-0 space-y-6 overflow-y-auto">
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
                    <div className={cn('grid place-items-center h-10 w-10 rounded-2xl')} style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { backgroundColor: 'var(--card)', color: 'var(--text-secondary)' }}>
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
                    <div className={cn('grid place-items-center h-10 w-10 rounded-2xl')} style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { backgroundColor: 'var(--card)', color: 'var(--text-secondary)' }}>
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

        <div className="absolute bottom-0 w-full border-t border-border px-4 py-4 bg-transparent">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200', isCollapsed && 'justify-center px-0')}
                style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { color: 'var(--text-secondary)' }}
              >
                <div className={cn('grid place-items-center h-10 w-10 rounded-2xl')} style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', color: 'var(--accent-mint)' } : { backgroundColor: 'var(--card)', color: 'var(--text-secondary)' }}>
                  <Icon size={20} />
                </div>
                <span className={cn('text-sm font-medium transition-opacity duration-200', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
