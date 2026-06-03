'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useActiveRoute } from '@/hooks/use-active-route';
import { bottomNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { openGlobalSearch } from '@/src/lib/global-search-events';

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-[rgba(8,10,15,0.92)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:hidden">
      <div className="mx-auto mb-3 max-w-4xl">
        <button
          type="button"
          onClick={openGlobalSearch}
          className="flex w-full items-center justify-between rounded-[24px] border border-border bg-card px-4 py-3 text-left text-sm text-secondary shadow-[0_14px_28px_rgba(0,0,0,0.24)]"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#0D141B] text-[#7EE7C7]">
              <Search size={18} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Global Search</p>
              <p className="text-xs text-secondary">Search anything or run a command</p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-[#0D141B] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-secondary">
            Ctrl K
          </span>
        </button>
      </div>

      <div className="mx-auto grid h-full max-w-4xl grid-cols-4 gap-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-[24px] px-3 py-2.5 transition-all duration-200',
                active
                  ? 'bg-[rgba(0,245,196,0.12)] text-[#00F5C4] shadow-[0_10px_24px_rgba(0,245,196,0.14)]'
                  : 'text-secondary hover:bg-card/80 hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'grid size-11 place-items-center rounded-2xl border border-transparent',
                  active ? 'border-[#00F5C4]/20 bg-[rgba(0,245,196,0.16)] text-[#00F5C4]' : 'bg-card text-secondary'
                )}
              >
                <Icon size={20} />
              </div>
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
