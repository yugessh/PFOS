"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { TransactionProvider } from '@/context/TransactionContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TransactionProvider>{children}</TransactionProvider>
    </AuthProvider>
  );
}
