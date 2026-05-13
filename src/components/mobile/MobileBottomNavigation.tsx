"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, CreditCard, BarChart2, Settings } from 'lucide-react';
import React from 'react';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileBottomNavigation() {
  const pathname = usePathname() || '/dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 sm:hidden">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.href || (t.href !== '/dashboard' && pathname?.startsWith(t.href));
            return (
              <Link key={t.href} href={t.href} className={`flex-1 flex flex-col items-center justify-center py-2 ${active ? 'text-blue-600' : 'text-zinc-500'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
