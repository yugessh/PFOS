"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { TransactionProvider } from '@/context/TransactionContext';
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
