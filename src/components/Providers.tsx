"use client";

import React from 'react';
import { AuthProvider } from '@/src/context/AuthContext';
import { TransactionProvider } from '@/src/context/TransactionContext';
import { AccountProvider } from '@/src/context/AccountContext';
import AppShell from './mobile/AppShell';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AccountProvider>
        <TransactionProvider>
          <AppShell>{children}</AppShell>
        </TransactionProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
