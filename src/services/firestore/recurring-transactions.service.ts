import {
  addDoc,
  collection as firestoreCollection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import { usersService } from './users.service';
import type { RecurringTransactionModel } from '@/src/lib/recurring';

async function ensureUserProfile(userId: string) {
  const existing = await usersService.getUserProfile(userId);
  if (!existing) {
    await usersService.initializeUserProfile(userId, { email: '' });
  }
}

function mapRecurringDoc(entry: any): RecurringTransactionModel {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    startDate: data.startDate?.toDate?.() || new Date(data.startDate || Date.now()),
    nextRunDate: data.nextRunDate?.toDate?.() || new Date(data.nextRunDate || Date.now()),
    lastRunDate: data.lastRunDate?.toDate?.() || null,
    endDate: data.endDate?.toDate?.() || null,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    deletedAt: data.deletedAt?.toDate?.() || null,
  } as RecurringTransactionModel;
}

export class RecurringTransactionsService {
  async getUserRecurringTransactions(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_RECURRING_TRANSACTIONS(userId)) as any;
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocs(q);
      const items = snap.docs.map((entry: any) => mapRecurringDoc(entry));
      return { success: true, data: { data: items } } as any;
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while loading recurring transactions. Please sign in again.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async upsertRecurringTransaction(
    userId: string,
    payload: Omit<RecurringTransactionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    recurringId?: string
  ) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_RECURRING_TRANSACTIONS(userId);

      if (recurringId) {
        const docRef = doc(db, `${colPath}/${recurringId}`);
        await updateDoc(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
          deletedAt: null,
        });

        return {
          success: true,
          data: {
            id: recurringId,
            ...payload,
            userId,
            updatedAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
          } as RecurringTransactionModel,
        };
      }

      const colRef = firestoreCollection(db, colPath) as any;
      const docRef = await addDoc(colRef, {
        ...payload,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      });

      return {
        success: true,
        data: {
          id: docRef.id,
          ...payload,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as RecurringTransactionModel,
      };
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while saving recurring transaction. Ensure you are signed in.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async removeRecurringTransaction(userId: string, recurringId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_RECURRING_TRANSACTIONS(userId)}/${recurringId}`);
      await updateDoc(docRef, {
        deletedAt: serverTimestamp(),
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async hasGeneratedTransaction(userId: string, recurringId: string, occurrenceDateKey: string) {
    const db = getFirestoreClient();
    if (!db) return false;

    const txRef = firestoreCollection(db, COLLECTIONS.TRANSACTIONS) as any;
    const q = query(
      txRef,
      where('userId', '==', userId),
      where('metadata.recurringTransactionId', '==', recurringId),
      where('metadata.occurrenceDateKey', '==', occurrenceDateKey),
      where('deletedAt', '==', null)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async markProcessed(
    userId: string,
    recurringId: string,
    payload: { nextRunDate: Date; lastRunDate: Date }
  ) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    const docRef = doc(db, `${SUBCOLLECTIONS.USER_RECURRING_TRANSACTIONS(userId)}/${recurringId}`);
    await updateDoc(docRef, {
      nextRunDate: payload.nextRunDate,
      lastRunDate: payload.lastRunDate,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  }
}

export const recurringTransactionsService = new RecurringTransactionsService();
