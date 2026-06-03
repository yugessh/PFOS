import { getFirestoreClient } from './firebaseClient';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { accountsService } from './accounts.service';

export interface ImportHistoryRecord {
  id?: string;
  userId: string;
  fileName: string;
  fileSize: number;
  templateUsed: string;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  status: 'completed' | 'rolled_back' | 'failed';
  accountId: string;
  accountName: string;
  createdAt?: any;
  updatedAt?: any;
  errors?: string[];
}

export class ImportService {
  /**
   * Log an import execution run in user subcollection
   */
  async createImportHistory(userId: string, record: Omit<ImportHistoryRecord, 'userId'>) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    try {
      const colRef = collection(db, 'users', userId, 'importHistory');
      const prepared = {
        ...record,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(colRef, prepared);
      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error('ImportService.createImportHistory', err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Retrieve all past import runs for a user
   */
  async getUserImportHistory(userId: string) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    try {
      const colRef = collection(db, 'users', userId, 'importHistory');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
      })) as ImportHistoryRecord[];

      return { success: true, data };
    } catch (err: any) {
      console.error('ImportService.getUserImportHistory', err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  /**
   * Rollback a previous import
   * Deletes all transactions, investments, and trades linked to the importId
   * and adjusts the respective account balances in reverse.
   */
  async rollbackImport(userId: string, importId: string) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    try {
      // 1. Fetch the import history document to verify it is not already rolled back
      const historyRef = collection(db, 'users', userId, 'importHistory');
      const historySnap = await getDocs(query(historyRef));
      const historyDoc = historySnap.docs.find(d => d.id === importId);
      
      if (!historyDoc) {
        return { success: false, error: 'Import log record not found' };
      }

      const historyData = historyDoc.data() as ImportHistoryRecord;
      if (historyData.status === 'rolled_back') {
        return { success: false, error: 'This import has already been rolled back' };
      }

      // 2. Query transactions matching this importId
      const txsRef = collection(db, 'transactions');
      const txsQuery = query(txsRef, where('userId', '==', userId), where('metadata.importId', '==', importId));
      const txsSnap = await getDocs(txsQuery);
      const importedTxs = txsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Query investments matching this importId
      const invRef = collection(db, 'users', userId, 'investments');
      const invQuery = query(invRef, where('metadata.importId', '==', importId));
      const invSnap = await getDocs(invQuery);
      const importedInvs = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 4. Query trading journal records matching this importId
      const tradeRef = collection(db, 'users', userId, 'tradingJournal');
      const tradeQuery = query(tradeRef, where('metadata.importId', '==', importId));
      const tradeSnap = await getDocs(tradeQuery);
      const importedTrades = tradeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      console.log(`Rolling back ${importedTxs.length} transactions, ${importedInvs.length} investments, ${importedTrades.length} trades`);

      // 5. Calculate net balance change per account to reverse impact
      const balanceAdjustments: Record<string, number> = {};

      importedTxs.forEach((tx: any) => {
        const accountId = tx.accountId || tx.account;
        const amount = Number(tx.amount || 0);
        if (!accountId) return;

        if (tx.type === 'income') {
          // Reversing income: subtract from balance
          balanceAdjustments[accountId] = (balanceAdjustments[accountId] || 0) - amount;
        } else if (tx.type === 'expense') {
          // Reversing expense: add back to balance
          balanceAdjustments[accountId] = (balanceAdjustments[accountId] || 0) + amount;
        } else if (tx.type === 'transfer') {
          // Reversing transfer: add back to source account, subtract from destination account
          balanceAdjustments[accountId] = (balanceAdjustments[accountId] || 0) + amount;
          const destinationAccountId = tx.toAccount || tx.toAccountId;
          if (destinationAccountId) {
            balanceAdjustments[destinationAccountId] = (balanceAdjustments[destinationAccountId] || 0) - amount;
          }
        }
      });

      // 6. Apply account balance updates
      for (const [accountId, adjustment] of Object.entries(balanceAdjustments)) {
        const accountRes = await accountsService.getAccountById(userId, accountId);
        if (accountRes.success && accountRes.data) {
          const currentBalance = Number(accountRes.data.balance || accountRes.data.currentBalance || 0);
          const nextBalance = currentBalance + adjustment;
          await accountsService.updateBalance(userId, accountId, nextBalance);
        }
      }

      // 7. Delete transactions, investments, and trades in batches
      const batch = writeBatch(db);

      txsSnap.docs.forEach(docRef => {
        batch.delete(doc(db, 'transactions', docRef.id));
      });

      invSnap.docs.forEach(docRef => {
        batch.delete(doc(db, 'users', userId, 'investments', docRef.id));
      });

      tradeSnap.docs.forEach(docRef => {
        batch.delete(doc(db, 'users', userId, 'tradingJournal', docRef.id));
      });

      // 8. Update the import history log record status
      const historyItemRef = doc(db, 'users', userId, 'importHistory', importId);
      batch.update(historyItemRef, {
        status: 'rolled_back',
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.error('ImportService.rollbackImport', err);
      return { success: false, error: err?.message || String(err) };
    }
  }
}

export const importService = new ImportService();
export default importService;
