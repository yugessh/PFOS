import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { BaseFirestoreService } from './base.service';
import type { NotificationModel, NotificationType, NotificationPriority } from '@/src/lib/notifications';

export class NotificationsService extends BaseFirestoreService<NotificationModel> {
  constructor() {
    super('notifications');
  }

  async getUserNotifications(userId: string, includeArchived = false): Promise<NotificationModel[]> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('isArchived', '==', includeArchived),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || null,
        archivedAt: doc.data().archivedAt?.toDate() || null,
        expiresAt: doc.data().expiresAt?.toDate() || null,
      })) as NotificationModel[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const db = getFirestoreClient();
      if (!db) return 0;

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('isRead', '==', false),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = doc(db, this.collectionName, notificationId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAsArchived(notificationId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const docRef = doc(db, this.collectionName, notificationId);
      await updateDoc(docRef, {
        isArchived: true,
        archivedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('isRead', '==', false),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      for (const docSnap of snapshot.docs) {
        batch.push(updateDoc(docSnap.ref, {
          isRead: true,
          readAt: Timestamp.now(),
        }));
      }

      await Promise.all(batch);
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
    expiresAt?: Date
  ): Promise<string> {
    try {
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore client not available');

      const notification: Omit<NotificationModel, 'id'> = {
        userId,
        type,
        title,
        message,
        priority,
        isRead: false,
        isArchived: false,
        metadata,
        actionUrl,
        createdAt: new Date(),
        readAt: null,
        archivedAt: null,
        expiresAt: expiresAt || null,
      };

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const db = getFirestoreClient();
      if (!db) return;

      const now = Timestamp.now();
      const q = query(
        collection(db, this.collectionName),
        where('expiresAt', '<=', now)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      for (const docSnap of snapshot.docs) {
        batch.push(deleteDoc(docSnap.ref));
      }

      await Promise.all(batch);
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}

export const notificationsService = new NotificationsService();