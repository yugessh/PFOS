import { useCallback, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { db } from '@/src/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface BackupMetadata {
  backupDate: Date;
  lastRestoreDate?: Date;
  dataSize?: number;
  itemCount?: number;
}

export interface BackupData {
  metadata: BackupMetadata;
  transactions: any[];
  accounts: any[];
  categories: any[];
  goals?: any[];
  investments?: any[];
  reminders?: any[];
  [key: string]: any;
}

export function useBackupRestore() {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadata | null>(null);

  // Load backup metadata from localStorage
  const loadBackupMetadata = useCallback(() => {
    try {
      const stored = localStorage.getItem(`pfos_backup_metadata_${user?.uid}`);
      if (stored) {
        const metadata = JSON.parse(stored);
        metadata.backupDate = new Date(metadata.backupDate);
        if (metadata.lastRestoreDate) {
          metadata.lastRestoreDate = new Date(metadata.lastRestoreDate);
        }
        setBackupMetadata(metadata);
      }
    } catch (err) {
      console.error('Failed to load backup metadata:', err);
    }
  }, [user?.uid]);

  // Export user data as JSON
  const exportAsJSON = useCallback(async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userRef = collection(db, `users/${user.uid}/transactions`);
      const accountsRef = collection(db, `users/${user.uid}/accounts`);
      const categoriesRef = collection(db, `users/${user.uid}/categories`);
      const goalsRef = collection(db, `users/${user.uid}/goals`);
      const investmentsRef = collection(db, `users/${user.uid}/investments`);
      const remindersRef = collection(db, `users/${user.uid}/reminders`);

      const [transactionsSnap, accountsSnap, categoriesSnap, goalsSnap, investmentsSnap, remindersSnap] = await Promise.all([
        getDocs(userRef),
        getDocs(accountsRef),
        getDocs(categoriesRef),
        getDocs(goalsRef),
        getDocs(investmentsRef),
        getDocs(remindersRef),
      ]);

      const backupData: BackupData = {
        metadata: {
          backupDate: new Date(),
          lastRestoreDate: backupMetadata?.lastRestoreDate,
        },
        transactions: transactionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        accounts: accountsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        categories: categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        goals: goalsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        investments: investmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        reminders: remindersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };

      // Calculate data size and item count
      const dataStr = JSON.stringify(backupData);
      backupData.metadata.dataSize = new Blob([dataStr]).size;
      backupData.metadata.itemCount =
        backupData.transactions.length +
        backupData.accounts.length +
        backupData.categories.length +
        (backupData.goals?.length || 0) +
        (backupData.investments?.length || 0) +
        (backupData.reminders?.length || 0);

      // Save backup metadata to localStorage
      const metadata = { ...backupData.metadata, backupDate: backupData.metadata.backupDate.toISOString() };
      localStorage.setItem(`pfos_backup_metadata_${user.uid}`, JSON.stringify(metadata));
      setBackupMetadata(backupData.metadata);

      return backupData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export backup';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, backupMetadata?.lastRestoreDate]);

  // Export as CSV
  const exportAsCSV = useCallback(async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      const transactionsSnap = await getDocs(transactionsRef);
      const transactions = transactionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Convert to CSV
      if (transactions.length === 0) {
        return '';
      }

      const headers = Object.keys(transactions[0]);
      const csvContent = [
        headers.join(','),
        ...transactions.map((tx) =>
          headers.map((h) => {
            const value = tx[h];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',')
        ),
      ].join('\n');

      return csvContent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export CSV';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Import data from backup
  const importFromBackup = useCallback(async (backupData: BackupData) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Note: In a real implementation, you would need to:
      // 1. Clear existing data (with user confirmation)
      // 2. Upload backup data back to Firestore
      // 3. This is a placeholder for the actual implementation

      // Update metadata
      const metadata = { 
        ...backupData.metadata, 
        lastRestoreDate: new Date(),
        backupDate: backupData.metadata.backupDate
      };
      localStorage.setItem(
        `pfos_backup_metadata_${user.uid}`,
        JSON.stringify({
          ...metadata,
          backupDate: metadata.backupDate.toISOString(),
          lastRestoreDate: metadata.lastRestoreDate.toISOString(),
        })
      );
      setBackupMetadata(metadata);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import backup';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  return {
    isLoading,
    error,
    backupMetadata,
    loadBackupMetadata,
    exportAsJSON,
    exportAsCSV,
    importFromBackup,
  };
}
