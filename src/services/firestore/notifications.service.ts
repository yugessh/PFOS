import { collection, doc, query, where, orderBy, limit, Timestamp, onSnapshot, DocumentData } from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import type { NotificationModel, NotificationType, NotificationPriority } from '@/src/lib/notifications';
import { getDocsSafe, getDocSafe, addDocSafe, updateDocSafe, deleteDocSafe, setDocSafe } from './safeFirestore';

export interface NotificationSettingsModel {
  userId: string;
  modules: Record<string, {
    enabled: boolean;
    sound: boolean;
    push: boolean;
    priorityOverride?: NotificationPriority;
  }>;
  soundEnabled: boolean;
  pushEnabled: boolean;
  priorityOverride: Partial<Record<string, NotificationPriority>>;
  updatedAt: Date;
  syncedAt: Date | null;
}

function normalizeNotificationDoc(docSnap: { id: string; data: () => DocumentData }): NotificationModel {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
    readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt ?? null,
    archivedAt: data.archivedAt?.toDate ? data.archivedAt.toDate() : data.archivedAt ?? null,
    expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt ?? null,
    isPinned: Boolean(data.isPinned),
    isDismissed: Boolean(data.isDismissed),
    syncStatus: data.syncStatus || 'synced',
  } as NotificationModel;
}

function getNotificationDocRef(userId: string, notificationId: string) {
    const snapshot = await getDocsSafe(q);
    return snapshot.docs.map((docSnap) => normalizeNotificationDoc(docSnap));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }

export class NotificationsService {
  async getUserNotifications(userId: string, includeArchived = false): Promise<NotificationModel[]> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
      const q = query(
        colRef,
        where('isArchived', '==', includeArchived),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocsSafe(q);
      return snapshot.docs.map((docSnap) => normalizeNotificationDoc(docSnap));
    } catch (error) {
      throw error;
    }
  }

  subscribeToUserNotifications(
    userId: string,
    includeArchived: boolean,
    callback: (notifications: NotificationModel[]) => void,
    onError?: (error: unknown) => void,
  ): () => void {
    const db = getFirestoreClient();
    if (!db) {
      callback([]);
      return () => undefined;
    }

    const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
    const q = query(
      colRef,
      where('isArchived', '==', includeArchived),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.docs.map((docSnap) => normalizeNotificationDoc(docSnap)));
      },
      (error) => {
        console.error('Error subscribing to notifications:', error);
        onError?.(error);
      }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const db = getFirestoreClient();
      if (!db) return 0;

      const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
      const q = query(
        colRef,
        where('isRead', '==', false),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocsSafe(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, {
        isRead: true,
        readAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAsArchived(notificationId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, {
        isArchived: true,
        archivedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  async pinNotification(notificationId: string, userId: string, isPinned = true): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, {
        isPinned,
        updatedAt: Timestamp.now(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error updating notification pin state:', error);
      throw error;
    }
  }

  async dismissNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, {
        isDismissed: true,
        isArchived: true,
        dismissedAt: Timestamp.now(),
        archivedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  }

  async restoreNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, {
        isDismissed: false,
        isArchived: false,
        archivedAt: null,
        dismissedAt: null,
        updatedAt: Timestamp.now(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error restoring notification:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
      const q = query(
        colRef,
        where('isRead', '==', false),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocsSafe(q);
      const ops: Promise<any>[] = [];
      for (const docSnap of snapshot.docs) {
        ops.push(updateDocSafe(docSnap.ref, {
          isRead: true,
          readAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }));
      }

      await Promise.all(ops);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    metadata?: Record<string, any>,
    actionUrl?: string,
    expiresAt?: Date,
    overrides: Partial<NotificationModel> = {}
  ): Promise<string> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const now = new Date();
      const notification: Omit<NotificationModel, 'id'> = {
        userId,
        type,
        title,
        message,
        priority: overrides.priority || priority,
        isRead: false,
        isArchived: false,
        isPinned: overrides.isPinned ?? false,
        isDismissed: overrides.isDismissed ?? false,
        module: overrides.module,
        groupKey: overrides.groupKey,
        groupLabel: overrides.groupLabel,
        sourceModule: overrides.sourceModule,
        sourceId: overrides.sourceId,
        priorityScore: overrides.priorityScore,
        priorityReason: overrides.priorityReason,
        syncStatus: overrides.syncStatus || 'synced',
        action: overrides.action,
        metadata,
        actionUrl,
        createdAt: now,
        updatedAt: now,
        readAt: null,
        archivedAt: null,
        dismissedAt: null,
        expiresAt: expiresAt || null,
      };

      const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
      const docRef = await addDocSafe(colRef, {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        readAt: null,
        archivedAt: null,
        dismissedAt: null,
      });
      if (!docRef) {
        throw new Error('Failed to create notification document');
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async cleanupExpiredNotifications(userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) return;

      const colRef = collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
      const now = Timestamp.now();
      const q = query(
        colRef,
    const snapshot = await getDocSafe(settingsRef);

    if (!snapshot.exists()) {
      const ops: Promise<any>[] = [];
      for (const docSnap of snapshot.docs) {
        ops.push(deleteDocSafe(docSnap.ref));
      const data = snapshot.data() || {};
    try {
      return {
        userId,
        modules: data.modules || {},
        soundEnabled: Boolean(data.soundEnabled),
        pushEnabled: Boolean(data.pushEnabled),
        priorityOverride: data.priorityOverride || {},
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        syncedAt: data.syncedAt?.toDate ? data.syncedAt.toDate() : null,
      };
      const db = getFirestoreClient();
      if (!db) return null;

      const settingsRef = getNotificationSettingsDocRef(userId);
      const snapshot = await getDocsSafe(query(collection(db, COLLECTIONS.USERS, userId, 'notificationSettings'), limit(1)));
      const data = snapshot.docs[0]?.data?.() || null;

      if (!data) {
        return null;
      }

      return {
        userId,
        modules: data.modules || {},
        soundEnabled: Boolean(data.soundEnabled),
        pushEnabled: Boolean(data.pushEnabled),
        priorityOverride: data.priorityOverride || {},
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        syncedAt: data.syncedAt?.toDate ? data.syncedAt.toDate() : null,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  async saveUserNotificationSettings(userId: string, settings: Partial<NotificationSettingsModel>): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const settingsRef = getNotificationSettingsDocRef(userId);
      await setDocSafe(settingsRef, {
        userId,
        ...settings,
        updatedAt: Timestamp.now(),
        syncedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }
}

export const notificationsService = new NotificationsService();