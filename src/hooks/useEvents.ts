'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { eventsService } from '@/src/services/firestore/events.service';
import type { FinancialEvent } from '@/src/types/firestore';

export function useEvents() {
  const auth = useAuthContext();
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await eventsService.getUserEvents(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load events');
      }
      setEvents(response.data?.data || []);
    } catch (err: any) {
      setError(err?.message || String(err));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const saveEvent = useCallback(
    async (payload: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>, eventId?: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');
      setSaving(true);
      setError(null);
      try {
        const response = await eventsService.upsertEvent(userId, payload, eventId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to save event');
        }
        await loadEvents();
        return response.data;
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadEvents]
  );

  const removeEvent = useCallback(
    async (eventId: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');
      setSaving(true);
      setError(null);
      try {
        const response = await eventsService.removeEvent(userId, eventId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to remove event');
        }
        await loadEvents();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadEvents]
  );

  return {
    events,
    loading,
    saving,
    error,
    saveEvent,
    removeEvent,
    reloadEvents: loadEvents,
  };
}
