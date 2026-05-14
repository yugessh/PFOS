'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { remindersService } from '@/src/services/firestore/reminders.service';
import { getReminderAlerts, getUpcomingReminders, type ReminderModel, type ReminderAlert } from '@/src/lib/reminders';

export function useReminders() {
  const auth = useAuthContext();
  const [reminders, setReminders] = useState<ReminderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await remindersService.getUserReminders(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load reminders');
      }

      setReminders(response.data?.data || []);
    } catch (err: any) {
      setError(err?.message || String(err));
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  const saveReminder = useCallback(
    async (payload: Omit<ReminderModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await remindersService.upsertReminder(userId, payload);
        if (!response.success) {
          throw new Error(response.error || 'Failed to save reminder');
        }

        await loadReminders();
        return response.data;
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadReminders]
  );

  const removeReminder = useCallback(
    async (reminderId: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await remindersService.removeReminder(userId, reminderId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to remove reminder');
        }

        await loadReminders();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadReminders]
  );

  const markReminderPaid = useCallback(
    async (reminderId: string, transactionId?: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await remindersService.markReminderPaid(userId, reminderId, transactionId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to mark reminder as paid');
        }

        await loadReminders();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadReminders]
  );

  const reminderAlerts = useMemo(() => getReminderAlerts(reminders), [reminders]);

  const upcomingReminders = useMemo(() => getUpcomingReminders(reminders), [reminders]);

  return {
    reminders,
    reminderAlerts,
    upcomingReminders,
    loading,
    saving,
    error,
    saveReminder,
    removeReminder,
    markReminderPaid,
    reloadReminders: loadReminders,
  };
}