'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';

/**
 * Offline indicator & fallback component
 * Shows connection status and graceful degradation
 */
export function OfflineFallback() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline === null) return null;

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-background p-3 flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600/90 text-background p-3 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top duration-300">
      <CheckCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Back online</span>
    </div>
  );
}
