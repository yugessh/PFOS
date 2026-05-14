"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { recurringTransactionsService } from '@/src/services/firestore/recurring-transactions.service';
import {
  getRecurringAlerts,
  type RecurringAlert,
  type RecurringTransactionModel,
} from '@/src/lib/recurring';

export function useRecurringTransactions() {
  const { user } = useAuthContext();
  const [items, setItems] = useState<RecurringTransactionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await recurringTransactionsService.getUserRecurringTransactions(user.uid);
      if (!res.success) throw new Error(res.error || 'Failed to load recurring transactions');

      const recurring = (res.data?.data || []) as RecurringTransactionModel[];
      recurring.sort((a, b) => new Date(a.nextRunDate).getTime() - new Date(b.nextRunDate).getTime());
      setItems(recurring);
    } catch (err: any) {
      setError(err?.message || String(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const alerts = useMemo<RecurringAlert[]>(() => getRecurringAlerts(items), [items]);

  const saveRecurring = useCallback(
    async (
      payload: Omit<RecurringTransactionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
      recurringId?: string
    ) => {
      if (!user?.uid) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);
      try {
        const res = await recurringTransactionsService.upsertRecurringTransaction(user.uid, payload, recurringId);
        if (!res.success || !res.data) throw new Error(res.error || 'Failed to save recurring transaction');
        await refresh();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pfos:recurring-updated'));
        }
        return res.data;
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [refresh, user?.uid]
  );

  const removeRecurring = useCallback(
    async (recurringId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const res = await recurringTransactionsService.removeRecurringTransaction(user.uid, recurringId);
      if (!res.success) throw new Error(res.error || 'Failed to remove recurring transaction');
      setItems((prev) => prev.filter((item) => item.id !== recurringId));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pfos:recurring-updated'));
      }
    },
    [user?.uid]
  );

  return {
    recurringTransactions: items,
    recurringAlerts: alerts,
    loading,
    saving,
    error,
    refresh,
    saveRecurring,
    removeRecurring,
  };
}
