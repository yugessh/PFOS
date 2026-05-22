import { useEffect, useState } from 'react';
import { syncManager } from '@/src/services/offline/syncManager';

export type ConnectionState = 'online' | 'offline' | 'syncing';

export function useConnectionStatus() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncing, setSyncing] = useState<boolean>(syncManager.syncing);
  const [pending, setPending] = useState<number>(syncManager.getPendingCount());

  useEffect(() => {
    // Remove online/offline event listeners to avoid Back Online UI triggers.
    const unsub = syncManager.subscribe(() => {
      setSyncing(syncManager.syncing);
      setPending(syncManager.getPendingCount());
    });

    return () => {
      unsub();
    };
  }, []);

  const state: ConnectionState = !online ? 'offline' : syncing ? 'syncing' : 'online';

  return { state, online, syncing, pending, flush: () => syncManager.flush() };
}
