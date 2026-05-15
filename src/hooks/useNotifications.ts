'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { notificationsService } from '@/src/services/firestore/notifications.service';
import { SmartAlertEngine } from '@/src/services/firestore/smart-alert-engine';
import type { NotificationModel } from '@/src/lib/notifications';

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
    notifications.filter(n => !n.isRead && !n.isArchived),
    [notifications]
  );

  const unreadCount = unreadNotifications.length;

  const notificationsByPriority = useMemo(() => {
    const grouped = {
      urgent: [] as NotificationModel[],
      high: [] as NotificationModel[],
      medium: [] as NotificationModel[],
      low: [] as NotificationModel[],
    };

    notifications
      .filter(n => !n.isArchived)
      .forEach(n => {
        grouped[n.priority].push(n);
      });

    return grouped;
  }, [notifications]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Generate smart alerts periodically (every 30 minutes)
  useEffect(() => {
    if (!auth?.user?.uid) return;

    const generateAlerts = () => generateSmartAlerts();
    generateAlerts(); // Generate immediately

    const interval = setInterval(generateAlerts, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [auth?.user?.uid, generateSmartAlerts]);

  return {
    notifications: notifications.filter(n => !n.isArchived),
    unreadNotifications,
    unreadCount,
    notificationsByPriority,
    loading,
    saving,
    error,
    loadNotifications,
    getUnreadCount,
    markAsRead,
    markAsArchived,
    markAllAsRead,
    generateSmartAlerts,
  };
}