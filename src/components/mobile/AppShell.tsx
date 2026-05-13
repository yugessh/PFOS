"use client";

import React, { ReactNode, useState } from 'react';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobileHeader from './MobileHeader';
import FloatingActionButton from './FloatingActionButton';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { useTransactions } from '@/src/hooks/useTransactions';

export default function AppShell({ children }: { children: ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const { addTransaction } = useTransactions();

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />

      <main className="pt-2 pb-24">
        <div className="max-w-md mx-auto px-4">{children}</div>
      </main>

      <FloatingActionButton onClick={() => setAddOpen(true)} />

      <MobileBottomNavigation />

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSave={(tx) => addTransaction(tx)} />
    </div>
  );
}
