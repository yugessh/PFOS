import { useCallback, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { getFirestoreClient } from '@/src/services/firestore/firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where, Timestamp } from 'firebase/firestore';

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

  const normalizeFirestoreValue = useCallback((value: any): any => {
    if (value && typeof value === 'object') {
      if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
        return new Timestamp(value.seconds, value.nanoseconds);
      }
      if (typeof value.toDate === 'function') {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((item) => normalizeFirestoreValue(item));
      }
      return Object.fromEntries(Object.entries(value).map(([key, fieldValue]) => [key, normalizeFirestoreValue(fieldValue)]));
    }
    return value;
  }, []);

  // Export user data as JSON
  const exportAsJSON = useCallback(async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = getFirestoreClient();
      if (!db) {
        setError('Firestore not initialized');
        return null;
      }

      const transactionsRef = query(collection(db, COLLECTIONS.TRANSACTIONS), where('userId', '==', user.uid));
      const accountsRef = collection(db, SUBCOLLECTIONS.USER_ACCOUNTS(user.uid));
      const categoriesRef = collection(db, SUBCOLLECTIONS.USER_CATEGORIES(user.uid));
      const goalsRef = collection(db, SUBCOLLECTIONS.USER_GOALS(user.uid));
      const investmentsRef = collection(db, SUBCOLLECTIONS.USER_INVESTMENTS(user.uid));
      const remindersRef = collection(db, SUBCOLLECTIONS.USER_REMINDERS(user.uid));

      const [transactionsSnap, accountsSnap, categoriesSnap, goalsSnap, investmentsSnap, remindersSnap] = await Promise.all([
        getDocs(transactionsRef),
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
      const db = getFirestoreClient();
      if (!db) {
        setError('Firestore not initialized');
        return null;
      }

      const transactionsRef = query(collection(db, COLLECTIONS.TRANSACTIONS), where('userId', '==', user.uid));
      const transactionsSnap = await getDocs(transactionsRef);
      const transactions = transactionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Convert to CSV
      if (transactions.length === 0) {
        return '';
      }

      const headers = Object.keys(transactions[0]);
      const csvContent = [
        headers.join(','),
        ...transactions.map((tx) => {
          const row = tx as Record<string, any>;
          return headers.map((h) => {
            const value = row[h];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',');
        }),
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
      const db = getFirestoreClient();
      if (!db) {
        setError('Firestore not initialized');
        return false;
      }

      const normalizedData = (item: any) => ({
        ...Object.fromEntries(
          Object.entries(item || {}).map(([key, value]) => [key, normalizeFirestoreValue(value)])
        ),
      });

      const transactionWrites = (backupData.transactions || []).map((transaction) => {
        const payload = normalizedData(transaction);
        return setDoc(doc(db, COLLECTIONS.TRANSACTIONS, transaction.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      const accountWrites = (backupData.accounts || []).map((account) => {
        const payload = normalizedData(account);
        return setDoc(doc(db, SUBCOLLECTIONS.USER_ACCOUNTS(user.uid), account.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      const categoryWrites = (backupData.categories || []).map((category) => {
        const payload = normalizedData(category);
        return setDoc(doc(db, SUBCOLLECTIONS.USER_CATEGORIES(user.uid), category.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      const goalWrites = (backupData.goals || []).map((goal) => {
        const payload = normalizedData(goal);
        return setDoc(doc(db, SUBCOLLECTIONS.USER_GOALS(user.uid), goal.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      const investmentWrites = (backupData.investments || []).map((investment) => {
        const payload = normalizedData(investment);
        return setDoc(doc(db, SUBCOLLECTIONS.USER_INVESTMENTS(user.uid), investment.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      const reminderWrites = (backupData.reminders || []).map((reminder) => {
        const payload = normalizedData(reminder);
        return setDoc(doc(db, SUBCOLLECTIONS.USER_REMINDERS(user.uid), reminder.id), {
          ...payload,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: payload.createdAt || serverTimestamp(),
        });
      });

      await Promise.all([
        ...transactionWrites,
        ...accountWrites,
        ...categoryWrites,
        ...goalWrites,
        ...investmentWrites,
        ...reminderWrites,
      ]);

      const metadata = {
        ...backupData.metadata,
        lastRestoreDate: new Date(),
        backupDate: backupData.metadata.backupDate,
      };
      localStorage.setItem(
        `pfos_backup_metadata_${user.uid}`,
        JSON.stringify({
          ...metadata,
          backupDate: metadata.backupDate.toISOString(),
          lastRestoreDate: metadata.lastRestoreDate?.toISOString(),
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
  }, [user?.uid, normalizeFirestoreValue]);

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
