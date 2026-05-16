'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { db } from '@/src/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
  Database,
  Cloud,
  Bell,
  Lock,
  HardDrive,
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagnosticStatus {
  firestore: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    lastCheck: Date;
  };
  auth: {
    status: 'authenticated' | 'unauthenticated';
    user?: { uid: string; email?: string; displayName?: string };
  };
  storage: {
    collections: Record<string, number>;
    totalItems: number;
    estimatedSize: number;
  };
  notifications: {
    status: 'enabled' | 'disabled';
    permissions: NotificationPermission;
  };
  offlineSync: {
    status: 'active' | 'inactive';
    pendingWrites: number;
  };
}

export default function DiagnosticsPage() {
  const { user } = useAuthContext();
  const [diagnostics, setDiagnostics] = useState<DiagnosticStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const checkDiagnostics = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();

      // Check Firestore connection
      let firestoreStatus: DiagnosticStatus['firestore']['status'] = 'connected';
      let responseTime = 0;
      try {
        const collections = ['transactions', 'accounts', 'categories'];
        const checkTime = Date.now();
        for (const colName of collections) {
          const colRef = collection(db, `users/${user?.uid}/${colName}`);
          await getDocs(colRef);
        }
        responseTime = Date.now() - checkTime;
      } catch (err) {
        firestoreStatus = 'error';
        responseTime = Date.now() - startTime;
      }

      // Check auth status
      const authStatus = user ? 'authenticated' : 'unauthenticated';

      // Get collection counts
      const collectionNames = [
        'transactions',
        'accounts',
        'categories',
        'goals',
        'investments',
        'reminders',
      ];
      const storage: DiagnosticStatus['storage'] = {
        collections: {},
        totalItems: 0,
        estimatedSize: 0,
      };

      for (const colName of collectionNames) {
        try {
          const colRef = collection(db, `users/${user?.uid}/${colName}`);
          const snap = await getDocs(colRef);
          const count = snap.docs.length;
          storage.collections[colName] = count;
          storage.totalItems += count;

          // Estimate size
          snap.docs.forEach((doc) => {
            const dataStr = JSON.stringify(doc.data());
            storage.estimatedSize += new Blob([dataStr]).size;
          });
        } catch (err) {
          storage.collections[colName] = 0;
        }
      }

      // Check notifications
      const notificationsStatus =
        typeof window !== 'undefined' && 'Notification' in window ? 'enabled' : 'disabled';
      const notificationPermission =
        typeof window !== 'undefined' && 'Notification' in window
          ? Notification.permission
          : ('denied' as NotificationPermission);

      // Check offline sync (Firestore offline persistence)
      const offlineSyncActive =
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined' &&
        localStorage.getItem('firebaseLocalStorageReady') !== null;

      setDiagnostics({
        firestore: {
          status: firestoreStatus,
          responseTime,
          lastCheck: new Date(),
        },
        auth: {
          status: authStatus as any,
          user: user
            ? { uid: user.uid, email: user.email, displayName: user.displayName }
            : undefined,
        },
        storage,
        notifications: {
          status: notificationsStatus as any,
          permissions: notificationPermission,
        },
        offlineSync: {
          status: offlineSyncActive ? 'active' : 'inactive',
          pendingWrites: 0,
        },
      });
    } catch (err) {
      console.error('Diagnostics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDiagnostics();
  }, [user?.uid, refreshCount]);

  const StatusBadge = ({ status }: { status: string }) => {
    const isGood = status === 'connected' || status === 'authenticated' || status === 'enabled' || status === 'active';
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isGood ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
        {isGood ? <CheckCircle className="size-3" /> : <AlertCircle className="size-3" />}
        <span className="text-xs font-semibold uppercase">{status}</span>
      </div>
    );
  };

  const DiagnosticCard = ({
    icon: Icon,
    title,
    status,
    details,
  }: {
    icon: React.ReactNode;
    title: string;
    status: string;
    details: React.ReactNode;
  }) => (
    <div className="rounded-[32px] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{Icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="text-sm text-secondary">{details}</div>
    </div>
  );

  if (isLoading && !diagnostics) {
    return (
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent-mint border-t-transparent" />
            <p className="text-sm text-secondary">Running diagnostics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Diagnostics</h1>
          <p className="text-sm text-secondary">
            Health check last updated:{' '}
            {diagnostics?.firestore.lastCheck?.toLocaleTimeString() || 'N/A'}
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <Button
            onClick={() => setRefreshCount((c) => c + 1)}
            disabled={isLoading}
            className="rounded-xl bg-accent-mint text-[#071a0d] font-semibold hover:brightness-95 transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            {isLoading ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>

        {/* Diagnostics Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {diagnostics && (
            <>
              {/* Firestore */}
              <DiagnosticCard
                icon="🗄️"
                title="Firestore Status"
                status={diagnostics.firestore.status}
                details={
                  <div className="space-y-1">
                    <p>Response Time: {diagnostics.firestore.responseTime}ms</p>
                    <p>Connection Status: {diagnostics.firestore.status === 'connected' ? '✓ Connected' : '✗ Disconnected'}</p>
                  </div>
                }
              />

              {/* Authentication */}
              <DiagnosticCard
                icon={<Lock className="size-6 text-blue-400" />}
                title="Authentication"
                status={diagnostics.auth.status}
                details={
                  <div className="space-y-1">
                    <p>Status: {diagnostics.auth.status}</p>
                    {diagnostics.auth.user && (
                      <>
                        <p>UID: {diagnostics.auth.user.uid.slice(0, 12)}...</p>
                        <p>Email: {diagnostics.auth.user.email || 'N/A'}</p>
                        <p>Display Name: {diagnostics.auth.user.displayName || 'N/A'}</p>
                      </>
                    )}
                  </div>
                }
              />

              {/* Storage & Collections */}
              <DiagnosticCard
                icon={<Package className="size-6 text-purple-400" />}
                title="Data Storage"
                status={diagnostics.storage.totalItems > 0 ? 'active' : 'empty'}
                details={
                  <div className="space-y-2">
                    <p>Total Items: {diagnostics.storage.totalItems}</p>
                    <p>Estimated Size: {formatBytes(diagnostics.storage.estimatedSize)}</p>
                    <div className="mt-3 space-y-1 text-xs">
                      {Object.entries(diagnostics.storage.collections).map(([col, count]) => (
                        <p key={col}>
                          {col}: {count} items
                        </p>
                      ))}
                    </div>
                  </div>
                }
              />

              {/* Notifications */}
              <DiagnosticCard
                icon={<Bell className="size-6 text-amber-400" />}
                title="Notifications"
                status={diagnostics.notifications.permissions}
                details={
                  <div className="space-y-1">
                    <p>Status: {diagnostics.notifications.status}</p>
                    <p>Permission: {diagnostics.notifications.permissions || 'default'}</p>
                  </div>
                }
              />

              {/* Offline Sync */}
              <DiagnosticCard
                icon={<Cloud className="size-6 text-cyan-400" />}
                title="Offline Sync"
                status={diagnostics.offlineSync.status}
                details={
                  <div className="space-y-1">
                    <p>Status: {diagnostics.offlineSync.status}</p>
                    <p>Pending Writes: {diagnostics.offlineSync.pendingWrites}</p>
                  </div>
                }
              />

              {/* Database */}
              <DiagnosticCard
                icon={<Database className="size-6 text-green-400" />}
                title="Database"
                status={diagnostics.firestore.status}
                details={
                  <div className="space-y-1">
                    <p>Provider: Firebase Firestore</p>
                    <p>Region: Multi-region</p>
                    <p>Persistence: Enabled</p>
                  </div>
                }
              />
            </>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 rounded-[32px] border border-border bg-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-secondary mb-4">
            Debug Information
          </h3>
          <pre className="text-xs text-muted-foreground overflow-auto max-h-64 p-4 rounded-lg bg-card-elevated">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
