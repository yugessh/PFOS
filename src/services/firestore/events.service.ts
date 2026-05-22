import {
  collection as firestoreCollection,
  doc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { addDocSafe, getDocsSafe, updateDocSafe } from './safeFirestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import { usersService } from './users.service';
import type { FinancialEvent } from '@/src/types/firestore';

async function ensureUserProfile(userId: string) {
  const existing = await usersService.getUserProfile(userId);
  if (!existing) {
    await usersService.initializeUserProfile(userId, { email: '' });
  }
}

function mapEventDoc(entry: any): FinancialEvent {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    userId: data.userId,
    title: data.title,
    eventType: data.eventType,
    amount: data.amount ?? 0,
    date: data.date?.toDate?.() || new Date(data.date || Date.now()),
    status: data.status,
    linkedModule: data.linkedModule,
    linkedId: data.linkedId,
    priority: data.priority,
    notes: data.notes,
    metadata: data.metadata || {},
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    deletedAt: data.deletedAt?.toDate?.() || null,
  } as FinancialEvent;
}

export class EventsService {
  async getUserEvents(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_EVENTS(userId)) as any;
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocsSafe(q as any);
      const items = snap.docs.map((entry: any) => mapEventDoc(entry));
      return { success: true, data: { data: items } };
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return { success: false, error: 'Permission denied while loading events. Please sign in again.', code: error?.code };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async upsertEvent(
    userId: string,
    payload: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    eventId?: string
  ) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      if (eventId) {
        const docRef = doc(db, `${SUBCOLLECTIONS.USER_EVENTS(userId)}/${eventId}`);
        await updateDocSafe(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
          deletedAt: null,
        });

        return { success: true, data: { id: eventId, ...payload, userId, updatedAt: new Date(), createdAt: new Date(), deletedAt: null } as FinancialEvent };
      }

      const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_EVENTS(userId)) as any;
      const docRef = await addDocSafe(colRef, {
        ...payload,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      });
      if (!docRef) {
        return { success: false, error: 'Failed to create event document' };
      }

      return { success: true, data: { id: docRef.id, ...payload, userId, createdAt: new Date(), updatedAt: new Date(), deletedAt: null } as FinancialEvent };
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('permission') || error?.code === 'permission-denied') {
        return { success: false, error: 'Permission denied while saving the event. Ensure you are signed in.', code: error?.code };
      }
      return { success: false, error: message, code: error?.code };
    }
  }

  async removeEvent(userId: string, eventId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(db, `${SUBCOLLECTIONS.USER_EVENTS(userId)}/${eventId}`);
      await updateDocSafe(docRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const eventsService = new EventsService();
