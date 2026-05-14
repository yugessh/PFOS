'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/use-active-route';
import { mainNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

// Only show main navigation items in bottom nav, shortened labels for mobile
const mobileNavItems = mainNavItems.slice(0, 5).map((item) => ({
  ...item,
  shortLabel:
    item.label === 'Transactions'
      ? 'Trans'
      : item.label === 'Investments'
        ? 'Invest'
        : item.label === 'Budgets'
          ? 'Budget'
          : item.label,
}));

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-40">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors',
              active
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground hover:text-sidebar-primary'
            )}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
