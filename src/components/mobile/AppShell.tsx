"use client";

import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobileHeader from './MobileHeader';
import FloatingActionButton from './FloatingActionButton';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { useTransactions } from '@/src/hooks/useTransactions';

export default function AppShell({ children }: { children: ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const { addTransaction } = useTransactions();
  const pathname = usePathname() || '/';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-200">
      {!isDashboardRoute ? <MobileHeader /> : null}

      <main className={isDashboardRoute ? 'pt-0 pb-0' : 'pt-2 pb-24'}>
        <div className="max-w-md mx-auto px-4">{children}</div>
      </main>

      {!isDashboardRoute ? <FloatingActionButton onClick={() => setAddOpen(true)} /> : null}

      {!isDashboardRoute ? <MobileBottomNavigation /> : null}

      {!isDashboardRoute ? (
        <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSave={(tx) => addTransaction(tx)} />
      ) : null}
    </div>
  );
}
