"use client";

import React from 'react';
import { AuthProvider } from '@/src/context/AuthContext';
import { SecurityProvider } from '@/src/context/SecurityContext';
import { TransactionProvider } from '@/src/context/TransactionContext';
import { AccountProvider } from '@/src/context/AccountContext';
import AppShell from './mobile/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { RealtimeNotificationStack } from '@/src/components/notifications/RealtimeNotificationStack';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Network online/offline toasts intentionally removed to preserve Neo Finance OS appearance.

  return (
    <AuthProvider>
      <SecurityProvider>
      <AccountProvider>
        <TransactionProvider>
          <AppShell>{children}</AppShell>
          <RealtimeNotificationStack />
          <Toaster />
        </TransactionProvider>
      </AccountProvider>
      </SecurityProvider>
    </AuthProvider>
  );
}
