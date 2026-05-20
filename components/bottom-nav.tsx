'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/use-active-route';
import { bottomNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 px-4 z-50 bg-bg-main border-t border-border backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.45)]">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-between gap-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] px-3 py-2 transition-all duration-200',
                active ? 'bg-[rgba(126,231,199,0.12)] text-accent-mint' : 'text-secondary hover:bg-card',
              )}
            >
              <div className={cn('grid place-items-center h-11 w-11 rounded-2xl', active ? 'bg-[rgba(126,231,199,0.16)] text-accent-mint' : 'bg-card text-secondary')}>
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
