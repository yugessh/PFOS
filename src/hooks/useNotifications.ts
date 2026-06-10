'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { notificationsService } from '@/src/services/firestore/notifications.service';
import { SmartAlertEngine } from '@/src/services/firestore/smart-alert-engine';
import { getNotificationGroupKey, getNotificationGroupLabel, normalizeNotificationPriority, type ActivityFeedItem, type NotificationGroup, type NotificationModel } from '@/src/lib/notifications';

export function useNotifications() {
  const auth = useAuthContext();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userNotifications = await notificationsService.getUserNotifications(userId);
      setNotifications(Array.isArray(userNotifications) ? userNotifications : []);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    const userId = auth?.user?.uid;
    if (!userId) {
      // Avoid synchronous setState inside effect body to prevent cascading renders
      Promise.resolve().then(() => {
        setNotifications([]);
        setLoading(false);
      });
      return;
    }

    // Schedule loading state update to avoid synchronous setState in effect
    Promise.resolve().then(() => setLoading(true));
    const unsubscribe = notificationsService.subscribeToUserNotifications(
      userId,
      false,
      (items) => {
        const ordered = [...items].sort((left, right) => {
          const leftPinned = left.isPinned ? 1 : 0;
          const rightPinned = right.isPinned ? 1 : 0;
          if (leftPinned !== rightPinned) return rightPinned - leftPinned;
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        });
        setNotifications(ordered);
        setLoading(false);
        setError(null);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth?.user?.uid]);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    const userId = auth?.user?.uid;
    if (!userId) return 0;

    try {
      return await notificationsService.getUnreadCount(userId);
    } catch (err) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  }, [auth?.user?.uid]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      await notificationsService.markAsRead(notificationId, userId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid]);

  const markAsArchived = useCallback(async (notificationId: string) => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      await notificationsService.markAsArchived(notificationId, userId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setError(null);
    } catch (err) {
      console.error('Error archiving notification:', err);
      setError('Failed to archive notification');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid]);

  const markAsPinned = useCallback(async (notificationId: string, isPinned = true) => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      await notificationsService.pinNotification(notificationId, userId, isPinned);
      setNotifications((prev) => prev.map((notification) => (
        notification.id === notificationId
          ? { ...notification, isPinned }
          : notification
      )));
      setError(null);
    } catch (err) {
      console.error('Error updating notification pin state:', err);
      setError('Failed to update notification pin state');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      await notificationsService.dismissNotification(notificationId, userId);
      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
      setError(null);
    } catch (err) {
      console.error('Error dismissing notification:', err);
      setError('Failed to dismiss notification');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid]);

  const restoreNotification = useCallback(async (notificationId: string) => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      await notificationsService.restoreNotification(notificationId, userId);
      await loadNotifications();
      setError(null);
    } catch (err) {
      console.error('Error restoring notification:', err);
      setError('Failed to restore notification');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid, loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) return;

    try {
      setSaving(true);
      await notificationsService.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid]);

  const generateSmartAlerts = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) return;

    try {
      const alertEngine = new SmartAlertEngine(userId);
      await alertEngine.generateAlerts();
      // Reload notifications after generating new ones
      await loadNotifications();
    } catch (err) {
      console.error('Error generating smart alerts:', err);
    }
  }, [auth?.user?.uid, loadNotifications]);

  // Computed values
  const unreadNotifications = useMemo(() =>
    notifications.filter(n => !n.isRead && !n.isArchived && !n.isDismissed),
    [notifications]
  );

  const unreadCount = unreadNotifications.length;

  const pinnedNotifications = useMemo(() =>
    notifications.filter((notification) => Boolean(notification.isPinned) && !notification.isArchived),
    [notifications]
  );

  const dismissedNotifications = useMemo(() =>
    notifications.filter((notification) => Boolean(notification.isDismissed)),
    [notifications]
  );

  const archivedNotifications = useMemo(() =>
    notifications.filter((notification) => notification.isArchived),
    [notifications]
  );

  const activeNotifications = useMemo(() =>
    notifications.filter((notification) => !notification.isArchived && !notification.isDismissed),
    [notifications]
  );

  const notificationsByPriority = useMemo(() => {
    const grouped = {
      critical: [] as NotificationModel[],
      urgent: [] as NotificationModel[],
      high: [] as NotificationModel[],
      medium: [] as NotificationModel[],
      low: [] as NotificationModel[],
    };

    notifications
      .filter((notification) => !notification.isArchived && !notification.isDismissed)
      .forEach((notification) => {
        const normalized = normalizeNotificationPriority(notification.priority);
        grouped[normalized].push(notification);
        if (normalized === 'critical') {
          grouped.urgent.push(notification);
        } else if (normalized === 'high') {
          grouped.high.push(notification);
        } else if (normalized === 'medium') {
          grouped.medium.push(notification);
        } else {
          grouped.low.push(notification);
        }
      });

    return grouped;
  }, [notifications]);

  const notificationsByModule = useMemo(() => {
    return activeNotifications.reduce<Record<string, NotificationModel[]>>((grouped, notification) => {
      const key = notification.module || notification.metadata?.category || 'general';
      grouped[key] = grouped[key] || [];
      grouped[key].push(notification);
      return grouped;
    }, {});
  }, [activeNotifications]);

  const notificationGroups = useMemo<NotificationGroup[]>(() => {
    const groupMap = new Map<string, NotificationModel[]>();

    activeNotifications.forEach((notification) => {
      const key = getNotificationGroupKey(notification);
      const existing = groupMap.get(key) || [];
      existing.push(notification);
      groupMap.set(key, existing);
    });

    return Array.from(groupMap.entries())
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return {
          key,
          label: getNotificationGroupLabel(sorted[0], sorted.length),
          count: sorted.length,
          notifications: sorted,
        };
      })
      .sort((a, b) => new Date(b.notifications[0]?.createdAt || 0).getTime() - new Date(a.notifications[0]?.createdAt || 0).getTime());
  }, [activeNotifications]);

  const notificationActivity = useMemo<ActivityFeedItem[]>(() => {
    return activeNotifications.map((notification) => ({
      id: `activity-${notification.id}`,
      title: notification.title,
      subtitle: notification.message,
      module: notification.module || notification.metadata?.category || 'general',
      priority: notification.priority,
      createdAt: notification.createdAt,
      url: notification.actionUrl,
      tone: normalizeNotificationPriority(notification.priority),
      metadata: notification.metadata,
    }));
  }, [activeNotifications]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    // Call async loader in a microtask to avoid synchronous state updates inside effect
    Promise.resolve().then(() => void loadNotifications());
  }, [loadNotifications]);

  // Generate smart alerts periodically (every 30 minutes)
  useEffect(() => {
    if (!auth?.user?.uid) return;

    const generateAlerts = () => void generateSmartAlerts();
    void generateAlerts(); // Generate immediately

    const interval = setInterval(() => void generateAlerts(), 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [auth?.user?.uid, generateSmartAlerts]);

  return {
    notifications: activeNotifications,
    allNotifications: notifications,
    unreadNotifications,
    unreadCount,
    notificationsByPriority,
    notificationsByModule,
    notificationGroups,
    notificationActivity,
    pinnedNotifications,
    archivedNotifications,
    dismissedNotifications,
    loading,
    saving,
    error,
    loadNotifications,
    getUnreadCount,
    markAsRead,
    markAsArchived,
    markAsPinned,
    dismissNotification,
    restoreNotification,
    markAllAsRead,
    generateSmartAlerts,
  };
}