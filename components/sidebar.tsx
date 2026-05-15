'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Settings, Bell } from 'lucide-react';
import { useActiveRoute } from '@/hooks/use-active-route';
import { sidebarNavItems, analyticsNavItems, settingsNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isActive } = useActiveRoute();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold text-primary">PFOS</h1>
        <Bell size={20} className="text-muted-foreground" />
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
          'fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 lg:translate-x-0 lg:relative',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border hidden lg:block">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">PF</span>
            </div>
            <h1 className="text-lg font-bold text-sidebar-foreground">PFOS</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-8 flex-1 mt-16 lg:mt-0 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Menu</p>
            <div className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    onClick={(e) => {
                      setIsOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Analytics Section */}
          <div>
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Analytics</p>
            <div className="space-y-1">
              {analyticsNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    onClick={(e) => {
                      setIsOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                onClick={(e) => {
                  setIsOpen(false);
                }}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
