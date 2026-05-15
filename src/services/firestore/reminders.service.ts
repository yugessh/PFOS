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
import type { ReminderModel, ReminderAlert } from '@/src/lib/reminders';

async function ensureUserProfile(userId: string) {
  const existing = await usersService.getUserProfile(userId);
  if (!existing) {
    await usersService.initializeUserProfile(userId, { email: '' });
  }
}

function mapReminderDoc(entry: any): ReminderModel {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate || Date.now()),
    paidDate: data.paidDate?.toDate?.() || null,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    deletedAt: data.deletedAt?.toDate?.() || null,
  } as ReminderModel;
}

export class RemindersService {
  async getUserReminders(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_REMINDERS(userId)) as any;
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocs(q);
      const items = snap.docs.map((entry: any) => mapReminderDoc(entry));
      return { success: true, data: { data: items } } as any;
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while loading reminders. Please sign in again.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async upsertReminder(
    userId: string,
    payload: Omit<ReminderModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    reminderId?: string
  ): Promise<any> {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_REMINDERS(userId);

      if (reminderId) {
        const docRef = doc(db, `${colPath}/${reminderId}`);
        await updateDoc(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
          deletedAt: null,
        });

        return {
          success: true,
          data: {
            id: reminderId,
            ...payload,
            userId,
            updatedAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
          } as ReminderModel,
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
        } as ReminderModel,
      };
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return {
          success: false,
          error: 'Permission denied while saving reminder. Ensure you are signed in.',
          code: error?.code,
        };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async removeReminder(userId: string, reminderId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS, reminderId);
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

  async markReminderPaid(userId: string, reminderId: string, transactionId?: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS, reminderId);
      await updateDoc(docRef, {
        isPaid: true,
        paidDate: new Date(),
        transactionId: transactionId || null,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const remindersService = new RemindersService();

// Helper functions
export function getReminderAlerts(items: ReminderModel[], now = new Date()): ReminderAlert[] {
  return items
    .filter((item) => item.isActive && !item.isPaid)
    .map((item) => {
      const dueDate = new Date(item.dueDate);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / msPerDay);

      return {
        reminderId: item.id,
        title: item.title,
        dueDate,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        amount: item.amount,
        type: item.type,
      };
    })
    .filter((alert) => alert.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function getUpcomingReminders(items: ReminderModel[], daysAhead = 30, now = new Date()): ReminderModel[] {
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);

  return items
    .filter((item) => item.isActive && !item.isPaid)
    .filter((item) => {
      const dueDate = new Date(item.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}