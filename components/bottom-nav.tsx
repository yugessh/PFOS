'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/use-active-route';
import { mainNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ORDER = ['Transactions', 'Notifications', 'Budgets', 'Accounts'];

const mobileNavItems = MOBILE_NAV_ORDER.map((label) => {
  const item = mainNavItems.find((item) => item.label === label);
  if (!item) return null;
  
  const shortLabels: Record<string, string> = {
    'Transactions': 'Feed',
    'Dashboard': 'Home',
    'Notifications': 'Alerts',
    'Budgets': 'Stats',
    'Accounts': 'Accounts',
  };
  
  return {
    ...item,
    shortLabel: shortLabels[item.label] || item.label,
  };
})
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border flex items-center justify-around px-2 z-40">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md transition-colors flex-1',
              active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={18} />
            <span className="text-[10px] font-medium">{item.shortLabel}</span>
            {active && <div className="w-1 h-0.5 bg-primary rounded-full mt-0.5" />}
          </Link>
        );
      })}
    </nav>
  );
}
