import { useEffect, useState } from 'react';
import { syncManager } from '@/src/services/offline/syncManager';

export type ConnectionState = 'online' | 'offline' | 'syncing';

export function useConnectionStatus() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncing, setSyncing] = useState<boolean>(syncManager.syncing);
  const [pending, setPending] = useState<number>(syncManager.getPendingCount());

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const unsub = syncManager.subscribe(() => {
      setSyncing(syncManager.syncing);
      setPending(syncManager.getPendingCount());
    });

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      unsub();
    };
  }, []);

  const state: ConnectionState = !online ? 'offline' : syncing ? 'syncing' : 'online';

  return { state, online, syncing, pending, flush: () => syncManager.flush() };
}
