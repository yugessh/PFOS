import { collection, doc, limit, orderBy, onSnapshot, query, Timestamp, where, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, deleteDocSafe, getDocsSafe, sanitizeFirestoreData, updateDocSafe } from './safeFirestore';
import type { NotificationModel, NotificationPriority, NotificationType } from '@/src/lib/notifications';

export type { NotificationSettingsModel } from './notification-settings.service';

function toDateValue(value: unknown, fallback: Date | null = null): Date | null {
  if (value == null) {
    return fallback;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
  }

  return fallback;
}

function normalizeNotificationDoc(docSnap: QueryDocumentSnapshot<DocumentData>): NotificationModel {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    userId: String(data.userId || ''),
    type: (data.type || 'transaction_alert') as NotificationType,
    title: String(data.title || ''),
    message: String(data.message || ''),
    priority: (data.priority || 'medium') as NotificationPriority,
    isRead: Boolean(data.isRead),
    isArchived: Boolean(data.isArchived),
    isPinned: Boolean(data.isPinned),
    isDismissed: Boolean(data.isDismissed),
    module: data.module,
    groupKey: data.groupKey,
    groupLabel: data.groupLabel,
    sourceModule: data.sourceModule,
    sourceId: data.sourceId,
    priorityScore: data.priorityScore,
    priorityReason: data.priorityReason,
    syncStatus: data.syncStatus || 'synced',
    action: data.action,
    metadata: data.metadata,
    actionUrl: data.actionUrl,
    createdAt: toDateValue(data.createdAt, new Date()) || new Date(),
    updatedAt: toDateValue(data.updatedAt, new Date()) || new Date(),
    readAt: toDateValue(data.readAt, null),
    archivedAt: toDateValue(data.archivedAt, null),
    expiresAt: toDateValue(data.expiresAt, null),
  };
}

function getNotificationCollectionRef(userId: string) {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error('Firestore client not available');
  }

  return collection(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId));
}

function getNotificationDocRef(userId: string, notificationId: string) {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error('Firestore client not available');
  }

  return doc(db, SUBCOLLECTIONS.USER_NOTIFICATIONS(userId), notificationId);
}

function toFirestoreTimestamp(value: Date | null | undefined): Timestamp | null {
  if (!value) {
    return null;
  }

  return value instanceof Timestamp ? value : Timestamp.fromDate(value);
}

function normalizeNotificationUpdatePayload(updates: Partial<NotificationModel>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...updates };

  if ('createdAt' in payload) payload.createdAt = toFirestoreTimestamp(payload.createdAt as Date | null | undefined);
  if ('updatedAt' in payload) payload.updatedAt = toFirestoreTimestamp(payload.updatedAt as Date | null | undefined) ?? Timestamp.now();
  if ('readAt' in payload) payload.readAt = toFirestoreTimestamp(payload.readAt as Date | null | undefined);
  if ('archivedAt' in payload) payload.archivedAt = toFirestoreTimestamp(payload.archivedAt as Date | null | undefined);
  if ('expiresAt' in payload) payload.expiresAt = toFirestoreTimestamp(payload.expiresAt as Date | null | undefined);

  return sanitizeFirestoreData(payload);
}

export class NotificationsService {
  async getUserNotifications(userId: string, includeArchived = false): Promise<NotificationModel[]> {
    try {
      const colRef = getNotificationCollectionRef(userId);
      const constraints = includeArchived
        ? [orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'), limit(100)]
        : [where('isArchived', '==', false), orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'), limit(100)];

      const snapshot = await getDocsSafe(query(colRef, ...constraints));
      return snapshot.docs.map((docSnap) => normalizeNotificationDoc(docSnap));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  subscribeToUserNotifications(
    userId: string,
    includeArchived: boolean,
    callback: (notifications: NotificationModel[]) => void,
    onError?: (error: unknown) => void,
  ): () => void {
    try {
      const colRef = getNotificationCollectionRef(userId);
      const constraints = includeArchived
        ? [orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'), limit(100)]
        : [where('isArchived', '==', false), orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'), limit(100)];

      return onSnapshot(
        query(colRef, ...constraints),
        (snapshot) => {
          callback(snapshot.docs.map((docSnap) => normalizeNotificationDoc(docSnap)));
        },
        (error) => {
          console.error('Error subscribing to notifications:', error);
          onError?.(error);
        }
      );
    } catch (error) {
      console.error('Error starting notifications subscription:', error);
      callback([]);
      return () => undefined;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const colRef = getNotificationCollectionRef(userId);
      const snapshot = await getDocsSafe(query(colRef, where('isRead', '==', false), where('isArchived', '==', false)));
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async updateNotification(userId: string, notificationId: string, updates: Partial<NotificationModel>): Promise<void> {
    try {
      const docRef = getNotificationDocRef(userId, notificationId);
      await updateDocSafe(docRef, normalizeNotificationUpdatePayload({ ...updates, updatedAt: updates.updatedAt ?? new Date() }));
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const docRef = getNotificationDocRef(userId, notificationId);
      await deleteDocSafe(docRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.updateNotification(userId, notificationId, {
      isRead: true,
      readAt: new Date(),
      syncStatus: 'synced',
    });
  }

  async markAsArchived(notificationId: string, userId: string): Promise<void> {
    await this.updateNotification(userId, notificationId, {
      isArchived: true,
      archivedAt: new Date(),
      syncStatus: 'synced',
    });
  }

  async pinNotification(notificationId: string, userId: string, isPinned = true): Promise<void> {
    await this.updateNotification(userId, notificationId, {
      isPinned,
      syncStatus: 'synced',
    });
  }

  async dismissNotification(notificationId: string, userId: string): Promise<void> {
    await this.updateNotification(userId, notificationId, {
      isDismissed: true,
      isArchived: true,
      archivedAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'synced',
    });
  }

  async restoreNotification(notificationId: string, userId: string): Promise<void> {
    await this.updateNotification(userId, notificationId, {
      isDismissed: false,
      isArchived: false,
      archivedAt: null,
      syncStatus: 'synced',
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const colRef = getNotificationCollectionRef(userId);
      const snapshot = await getDocsSafe(query(colRef, where('isRead', '==', false), where('isArchived', '==', false)));

      await Promise.all(
        snapshot.docs.map((docSnap) =>
          updateDocSafe(docSnap.ref, {
            isRead: true,
            readAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            syncStatus: 'synced',
          })
        )
      );
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
      const colRef = getNotificationCollectionRef(userId);
      const now = new Date();

      const payload = sanitizeFirestoreData({
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
        createdAt: Timestamp.fromDate(overrides.createdAt ?? now),
        updatedAt: Timestamp.fromDate(overrides.updatedAt ?? now),
        readAt: toFirestoreTimestamp(overrides.readAt ?? null),
        archivedAt: toFirestoreTimestamp(overrides.archivedAt ?? null),
        dismissedAt: toFirestoreTimestamp((overrides as Record<string, Date | null | undefined>).dismissedAt ?? null),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : toFirestoreTimestamp(overrides.expiresAt ?? null),
      });

      const docRef = await addDocSafe(colRef, payload);
      if (!docRef) {
        throw new Error('Failed to create notification');
      }
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async cleanupExpiredNotifications(userId: string): Promise<void> {
    try {
      const colRef = getNotificationCollectionRef(userId);
      const snapshot = await getDocsSafe(query(colRef, where('isArchived', '==', false), where('expiresAt', '<=', Timestamp.now())));

      await Promise.all(
        snapshot.docs.map((docSnap) =>
          updateDocSafe(docSnap.ref, {
            isArchived: true,
            archivedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            syncStatus: 'synced',
          })
        )
      );
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

export const notificationsService = new NotificationsService();
