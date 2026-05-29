import { doc, Timestamp } from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS } from '@/src/constants/collections';
import { getDocSafe, setDocSafe } from './safeFirestore';
import type { NotificationModule, NotificationPriority } from '@/src/lib/notifications';

export interface NotificationModulePreference {
  enabled: boolean;
  sound: boolean;
  push: boolean;
  priorityOverride?: NotificationPriority;
}

export interface NotificationSettingsModel {
  userId: string;
  soundEnabled: boolean;
  pushEnabled: boolean;
  priorityOverride: Partial<Record<NotificationModule, NotificationPriority>>;
  modules: Record<NotificationModule, NotificationModulePreference>;
  updatedAt: Date;
  syncedAt: Date | null;
}

export const DEFAULT_NOTIFICATION_MODULES: NotificationModule[] = [
  'transactions',
  'budgets',
  'goals',
  'investments',
  'trading',
  'emi',
  'bills',
  'subscriptions',
  'calendar',
  'ai',
  'automation',
  'security',
  'lending',
  'reports',
  'dashboard',
];

function createDefaultModules() {
  return DEFAULT_NOTIFICATION_MODULES.reduce<Record<NotificationModule, NotificationModulePreference>>((accumulator, module) => {
    accumulator[module] = {
      enabled: true,
      sound: true,
      push: true,
    };
    return accumulator;
  }, {} as Record<NotificationModule, NotificationModulePreference>);
}

function getSettingsDocRef(userId: string) {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error('Firestore client not available');
  }

  return doc(db, COLLECTIONS.USERS, userId, 'notificationSettings', 'preferences');
}

function normalizeSettings(userId: string, data: Record<string, any> | null): NotificationSettingsModel {
  return {
    userId,
    soundEnabled: data?.soundEnabled ?? true,
    pushEnabled: data?.pushEnabled ?? true,
    priorityOverride: data?.priorityOverride ?? {},
    modules: {
      ...createDefaultModules(),
      ...(data?.modules || {}),
    },
    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    syncedAt: data?.syncedAt?.toDate ? data.syncedAt.toDate() : null,
  };
}

export class NotificationSettingsService {
  async getUserNotificationSettings(userId: string): Promise<NotificationSettingsModel> {
    const db = getFirestoreClient();
    if (!db) {
      return normalizeSettings(userId, null);
    }

    const snapshot = await getDocSafe(getSettingsDocRef(userId));
    if (!snapshot.exists()) {
      return normalizeSettings(userId, null);
    }

    return normalizeSettings(userId, snapshot.data() as Record<string, any>);
  }

  async saveUserNotificationSettings(userId: string, settings: Partial<NotificationSettingsModel>): Promise<void> {
    const docRef = getSettingsDocRef(userId);
    await setDocSafe(
      docRef,
      {
        userId,
        ...settings,
        updatedAt: Timestamp.now(),
        syncedAt: Timestamp.now(),
      },
      { merge: true }
    );
  }
}

export const notificationSettingsService = new NotificationSettingsService();
