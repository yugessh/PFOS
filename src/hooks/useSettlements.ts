'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { settlementsService } from '@/src/services/firestore/settlements.service';
import { notificationsService } from '@/src/services/firestore/notifications.service';
import { calculateSettlementSummary, getSettlementStatus, type SettlementModel } from '@/src/lib/settlements';
import { useTransactions } from '@/src/hooks/useTransactions';

export function useSettlements() {
  const auth = useAuthContext();
  const { refresh: refreshTransactions } = useTransactions();
  const [settlements, setSettlements] = useState<SettlementModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettlements = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setSettlements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await settlementsService.getUserSettlements(userId);
      const safeSettlements = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      if (response.success) {
        setSettlements(safeSettlements);
      } else {
        setSettlements([]);
      }
    } catch (err: any) {
      console.error('Error loading settlements:', err);
      setError(err?.message || 'Failed to load settlements');
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadSettlements();
  }, [loadSettlements]);

  const addSettlement = useCallback(
    async (settlement: Omit<SettlementModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        await settlementsService.createSettlement(userId, settlement);
        await loadSettlements();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadSettlements]
  );

  const updateSettlement = useCallback(
    async (settlementId: string, settlement: Partial<SettlementModel>) => {
      setSaving(true);
      setError(null);

      try {
        await settlementsService.updateSettlement(settlementId, settlement);
        await loadSettlements();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadSettlements]
  );

  const deleteSettlement = useCallback(
    async (settlementId: string) => {
      setSaving(true);
      setError(null);

      try {
        await settlementsService.deleteSettlement(settlementId);
        await loadSettlements();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadSettlements]
  );

  const applyPayment = useCallback(
    async (settlementId: string, payment: {
      amount: number;
      date: Date;
      notes?: string;
      accountId?: string;
      transactionType: 'income' | 'expense';
      description?: string;
    }) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');
      if (!payment.amount || payment.amount <= 0) throw new Error('Enter a valid payment amount');

      setSaving(true);
      setError(null);

      try {
        const result = await settlementsService.applyPayment(userId, settlementId, payment);
        if (!result.success) {
          throw new Error(result.error || 'Failed to apply payment');
        }

        await refreshTransactions();
        await loadSettlements();
        return result.data;
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadSettlements, refreshTransactions]
  );

  const searchSettlements = useCallback(
    (query: string) => {
      const text = query.trim().toLowerCase();
      if (!text) return settlements;

      return settlements.filter((settlement) => {
        return [
          settlement.personName,
          settlement.status,
          settlement.type,
          settlement.description,
          settlement.notes,
          settlement.phone,
          settlement.linkedAccount,
        ]
          .filter(Boolean)
          .some((value) => value?.toString().toLowerCase().includes(text));
      });
    },
    [settlements]
  );

  const getSummary = useMemo(() => calculateSettlementSummary(settlements), [settlements]);

  const overdueReminders = useMemo(() => {
    const now = new Date();
    return settlements.filter((settlement) => {
      return (
        settlement.remainingAmount > 0 &&
        settlement.dueDate &&
        new Date(settlement.dueDate) < now
      );
    });
  }, [settlements]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return settlements.filter((settlement) => {
      return (
        settlement.remainingAmount > 0 &&
        settlement.dueDate &&
        new Date(settlement.dueDate) >= now &&
        new Date(settlement.dueDate) <= soon
      );
    });
  }, [settlements]);

  useEffect(() => {
    const userId = auth?.user?.uid;
    if (!userId || settlements.length === 0) return;

    const runNotifications = async () => {
      try {
        const existingNotifications = await notificationsService.getUserNotifications(userId);
        const allReminders = [...upcomingReminders, ...overdueReminders];

        for (const settlement of allReminders) {
          const type = settlement.status === 'overdue' ? 'debt_overdue' : 'debt_due';
          const title = settlement.status === 'overdue'
            ? `${settlement.personName} settlement overdue`
            : `${settlement.personName} payment due soon`;
          const message = settlement.status === 'overdue'
            ? `₹${settlement.remainingAmount} overdue for ${settlement.personName}. Settle now.`
            : `₹${settlement.remainingAmount} due by ${new Date(settlement.dueDate!).toLocaleDateString()}.`;

          const alreadyExists = existingNotifications.some((notification) => {
            return notification.metadata?.settlementId === settlement.id && notification.type === type;
          });

          if (!alreadyExists) {
            await notificationsService.createNotification(
              userId,
              type,
              title,
              message,
              'high',
              { settlementId: settlement.id, type: settlement.type },
              '/dashboard/settlements'
            );
          }
        }
      } catch (error) {
        console.error('Failed to create settlement notifications:', error);
      }
    };

    void runNotifications();
  }, [auth?.user?.uid, upcomingReminders, overdueReminders, settlements]);

  return {
    settlements,
    loading,
    saving,
    error,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    applyPayment,
    searchSettlements,
    summary: getSummary,
    overdueReminders,
    upcomingReminders,
    reload: loadSettlements,
  };
}
