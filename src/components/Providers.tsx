"use client";

import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { AuthProvider } from '@/src/context/AuthContext';
import { TransactionProvider } from '@/src/context/TransactionContext';
import { AccountProvider } from '@/src/context/AccountContext';
import AppShell from './mobile/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { OfflineBanner } from '@/components/ui/offline-banner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!window.navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
        variant: 'default',
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: 'Offline mode',
        description: 'Network unavailable. Some features will be limited.',
        variant: 'destructive',
      });
    };

    updateStatus();
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
          {isOffline && <OfflineBanner isOffline={isOffline} />}
        </TransactionProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
