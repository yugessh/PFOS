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
import type { EMIModel, EMIAlert, EMIPayment } from '@/src/lib/emi';

async function ensureUserProfile(userId: string) {
  const existing = await usersService.getUserProfile(userId);
  if (!existing) {
    await usersService.initializeUserProfile(userId, { email: '' });
  }
}

function mapEMIDoc(entry: any): EMIModel {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    startDate: data.startDate?.toDate?.() || new Date(data.startDate || Date.now()),
    endDate: data.endDate?.toDate?.() || null,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    deletedAt: data.deletedAt?.toDate?.() || null,
  } as EMIModel;
}

export class EMIService {
  async getUserEMIs(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_EMIS(userId)) as any;
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocs(q);
      const items = snap.docs.map((entry: any) => mapEMIDoc(entry));
      return { success: true, data: { data: items } } as any;
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while loading EMIs. Please sign in again.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async upsertEMI(
    userId: string,
    payload: Omit<EMIModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    emiId?: string
  ): Promise<any> {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_EMIS(userId);

      if (emiId) {
        const docRef = doc(db, `${colPath}/${emiId}`);
        await updateDoc(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
          deletedAt: null,
        });

        return {
          success: true,
          data: {
            id: emiId,
            ...payload,
            userId,
            updatedAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
          } as EMIModel,
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
        } as EMIModel,
      };
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while saving EMI. Ensure you are signed in.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async removeEMI(userId: string, emiId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_EMIS(userId)}/${emiId}`);
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

  async markEMIPaid(userId: string, emiId: string, installmentNumber: number, transactionId?: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      // Update EMI paid installments count
      const emiDocRef = doc(db, `${SUBCOLLECTIONS.USER_EMIS(userId)}/${emiId}`);
      const emiSnap = await getDocs(query(firestoreCollection(db, SUBCOLLECTIONS.USER_EMIS(userId)), where('__name__', '==', emiId)));
      if (!emiSnap.empty) {
        const emiData = emiSnap.docs[0].data() as EMIModel;
        await updateDoc(emiDocRef, {
          paidInstallments: (emiData.paidInstallments || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }

      // Record the payment
      const paymentRef = firestoreCollection(db, SUBCOLLECTIONS.USER_EMI_PAYMENTS(userId));
      await addDoc(paymentRef, {
        emiId,
        installmentNumber,
        amount: 0, // Will be calculated from EMI data
        dueDate: new Date(),
        paidDate: new Date(),
        isPaid: true,
        transactionId: transactionId || null,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const emiService = new EMIService();

// Helper functions
export function getEMIAlerts(items: EMIModel[], now = new Date()): EMIAlert[] {
  return items
    .filter((item) => item.isActive)
    .map((item) => {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const dueDate = new Date(currentYear, currentMonth, item.dueDate);

      // If due date has passed this month, check next month
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / msPerDay);

      return {
        emiId: item.id,
        title: item.title,
        dueDate,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        amount: item.monthlyInstallment,
        remainingInstallments: item.totalInstallments - (item.paidInstallments || 0),
      };
    })
    .filter((alert) => alert.daysUntilDue <= 7 && alert.remainingInstallments > 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function calculateEMIProgress(emi: EMIModel) {
  const paid = emi.paidInstallments || 0;
  const total = emi.totalInstallments;
  const remaining = total - paid;
  const progress = (paid / total) * 100;

  return {
    paid,
    total,
    remaining,
    progress,
    isCompleted: paid >= total,
  };
}