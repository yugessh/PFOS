'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/use-active-route';
import { bottomNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-18 flex items-center justify-around px-3 z-40" style={{ backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)', boxShadow: '0 -12px 32px rgba(0,0,0,0.35)' }}>
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-2 rounded-[20px] transition-all duration-200 flex-1 text-center',
              active
                ? ''
                : '',
            )}
            style={active ? { color: 'var(--accent-mint)' } : { color: 'var(--muted)' }}
          >
            <div style={active ? { backgroundColor: 'rgba(126,231,199,0.12)', padding: 8, borderRadius: 12 } : { padding: 8 }}>
              <Icon size={20} className="flex-shrink-0" />
            </div>
            <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            {active && <div className="mt-1 h-1 w-6 rounded-full" style={{ backgroundColor: 'var(--accent-mint)' }} />}
          </Link>
        );
      })}
    </nav>
  );
}
