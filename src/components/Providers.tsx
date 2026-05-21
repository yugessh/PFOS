"use client";

import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { AuthProvider } from '@/src/context/AuthContext';
import { TransactionProvider } from '@/src/context/TransactionContext';
import { AccountProvider } from '@/src/context/AccountContext';
import AppShell from './mobile/AppShell';
import { Toaster } from '@/components/ui/toaster';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
        variant: 'default',
        duration: 3000,
      });
    };
    const handleOffline = () => {
      toast({
        title: 'Offline mode',
        description: 'Network unavailable. Some features will be limited.',
        variant: 'destructive',
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <AccountProvider>
        <TransactionProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </TransactionProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
