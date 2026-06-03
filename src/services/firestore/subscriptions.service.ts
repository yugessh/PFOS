import {
  collection as firestoreCollection,
  doc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { addDocSafe, getDocsSafe, updateDocSafe } from './safeFirestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS } from '@/src/constants/collections';
import { usersService } from './users.service';

export interface PriceHistoryItem {
  date: string; // ISO string
  amount: number;
}

export interface CostSplitting {
  method: 'equal' | 'percentage' | 'fixed';
  shares: Record<string, number>; // name/email -> share amount or percentage
}

export interface SubscriptionModel {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  billingCycleStart: string; // ISO date
  nextRenewalDate: string; // ISO date
  status: 'active' | 'paused' | 'cancelled';
  paymentMethod: string;
  usageFrequency: 'high' | 'medium' | 'low' | 'unused';
  sharedWith: string[]; // List of family member names/emails
  costSplitting?: CostSplitting;
  priceHistory: PriceHistoryItem[];
  autoRenew: boolean;
  isDetected: boolean;
  lastUsedDate?: string;
  duplicateWith?: string[];
  createdAt?: any;
  updatedAt?: any;
  deletedAt?: any;
}

export interface SubscriptionOptimizationModel {
  id: string;
  userId: string;
  monthlySavings: number;
  yearlySavings: number;
  fireImpactYears: number;
  simulatedCancellations: string[]; // List of subscription IDs simulated cancelled
  simulatedDowngrades: Record<string, number>; // subscriptionId -> downgraded amount
  createdAt?: any;
  updatedAt?: any;
}

async function ensureUserProfile(userId: string) {
  const existing = await usersService.getUserProfile(userId);
  if (!existing) {
    await usersService.initializeUserProfile(userId, { email: '' });
  }
}

function mapSubscriptionDoc(entry: any): SubscriptionModel {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now()),
    deletedAt: data.deletedAt?.toDate?.() || null,
  } as SubscriptionModel;
}

function mapOptimizationDoc(entry: any): SubscriptionOptimizationModel {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now()),
  } as SubscriptionOptimizationModel;
}

export class SubscriptionsService {
  async getUserSubscriptions(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, COLLECTIONS.SUBSCRIPTIONS);
      const q = query(colRef, where('userId', '==', userId), where('deletedAt', '==', null));
      const snap = await getDocsSafe(q as any);
      const items = snap.docs.map((entry: any) => mapSubscriptionDoc(entry));
      return { success: true, data: { data: items } };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  }

  async upsertSubscription(
    userId: string,
    payload: Omit<SubscriptionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    subscriptionId?: string
  ): Promise<any> {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = COLLECTIONS.SUBSCRIPTIONS;

      if (subscriptionId) {
        const docRef = doc(db, `${colPath}/${subscriptionId}`);
        await updateDocSafe(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
          deletedAt: null,
        });

        return {
          success: true,
          data: {
            id: subscriptionId,
            ...payload,
            userId,
            updatedAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
          } as SubscriptionModel,
        };
      }

      const colRef = firestoreCollection(db, colPath);
      const docRef = await addDocSafe(colRef as any, {
        ...payload,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      });

      if (!docRef) {
        return { success: false, error: 'Failed to create subscription document' };
      }

      return {
        success: true,
        data: {
          id: docRef.id,
          ...payload,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as SubscriptionModel,
      };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  }

  async removeSubscription(userId: string, subscriptionId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId);
      await updateDocSafe(docRef, {
        deletedAt: serverTimestamp(),
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  }

  async getUserOptimizations(userId: string) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colRef = firestoreCollection(db, COLLECTIONS.SUBSCRIPTION_OPTIMIZATIONS);
      const q = query(colRef, where('userId', '==', userId));
      const snap = await getDocsSafe(q as any);
      const items = snap.docs.map((entry: any) => mapOptimizationDoc(entry));
      return { success: true, data: { data: items } };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  }

  async saveOptimization(
    userId: string,
    payload: Omit<SubscriptionOptimizationModel, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
    optimizationId?: string
  ) {
    try {
      await ensureUserProfile(userId);
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = COLLECTIONS.SUBSCRIPTION_OPTIMIZATIONS;

      if (optimizationId) {
        const docRef = doc(db, `${colPath}/${optimizationId}`);
        await updateDocSafe(docRef, {
          ...payload,
          userId,
          updatedAt: serverTimestamp(),
        });
        return { success: true, data: { id: optimizationId, ...payload, userId, updatedAt: new Date() } };
      }

      const colRef = firestoreCollection(db, colPath);
      const docRef = await addDocSafe(colRef as any, {
        ...payload,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (!docRef) return { success: false, error: 'Failed to create optimization document' };
      return { success: true, data: { id: docRef.id, ...payload, userId, createdAt: new Date(), updatedAt: new Date() } };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  }
}

export const subscriptionsService = new SubscriptionsService();
