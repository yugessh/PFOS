"use client";

import React from 'react';
import { AuthProvider } from '@/src/context/AuthContext';
import { TransactionProvider } from '@/src/context/TransactionContext';
import AppShell from './mobile/AppShell';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppShell>{children}</AppShell>
      </TransactionProvider>
    </AuthProvider>
  );
}
