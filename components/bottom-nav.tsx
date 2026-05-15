'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/use-active-route';
import { bottomNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { isActive } = useActiveRoute();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-1 z-40 shadow-lg shadow-black/5">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1',
              active
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className="text-[11px] font-semibold text-center line-clamp-1">{item.label}</span>
            {active && <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />}
          </Link>
        );
      })}
    </nav>
  );
}
