import {
  addDoc,
  collection as firestoreCollection,
  DocumentData,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import type { BudgetModel } from '@/src/lib/budgets';

export type BudgetDoc = Omit<BudgetModel, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  createdAt: any;
  updatedAt: any;
  deletedAt: any;
};

export class BudgetsService {
  async getUserBudgets(userId: string, monthKey: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_BUDGETS(userId)) as any;
      const q = query(
        colRef,
        where('deletedAt', '==', null),
        where('monthKey', '==', monthKey),
        where('isActive', '==', true)
      );

      const snap = await getDocs(q);
      const documents = snap.docs.map((entry: any) => {
        const data = entry.data();
        return {
          id: entry.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          deletedAt: data.deletedAt?.toDate?.() || null,
        } as BudgetModel;
      });

      return { success: true, data: { data: documents } } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async upsertBudget(
    userId: string,
    budget: Pick<BudgetModel, 'monthKey' | 'categoryId' | 'categoryName' | 'categoryIcon' | 'monthlyLimit' | 'currency'>
  ) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_BUDGETS(userId);
      const colRef = firestoreCollection(db, colPath) as any;
      const existingQuery = query(
        colRef,
        where('deletedAt', '==', null),
        where('monthKey', '==', budget.monthKey),
        where('categoryId', '==', budget.categoryId)
      );
      const existingSnap = await getDocs(existingQuery);

      const payload: DocumentData = {
        ...budget,
        userId,
        isActive: true,
        updatedAt: serverTimestamp(),
      };

      if (!existingSnap.empty) {
        const existing = existingSnap.docs[0];
        await updateDoc(doc(db, `${colPath}/${existing.id}`), payload);

        const updated = {
          id: existing.id,
          ...existing.data(),
          ...budget,
          userId,
          isActive: true,
          updatedAt: new Date(),
          deletedAt: null,
        } as BudgetModel;

        return { success: true, data: updated };
      }

      const createdPayload: DocumentData = {
        ...payload,
        createdAt: serverTimestamp(),
        deletedAt: null,
      };

      const docRef = await addDoc(colRef, createdPayload);
      const created = {
        id: docRef.id,
        ...budget,
        userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as BudgetModel;

      return { success: true, data: created };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async removeBudget(userId: string, budgetId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_BUDGETS(userId)}/${budgetId}`);
      await updateDoc(docRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: false,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const budgetsService = new BudgetsService();
