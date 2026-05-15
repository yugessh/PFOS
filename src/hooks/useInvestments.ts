'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { investmentsService } from '@/src/services/firestore/investments.service';
import type { InvestmentModel } from '@/src/lib/investments';

export function useInvestments() {
  const auth = useAuthContext();
  const [investments, setInvestments] = useState<InvestmentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvestments = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await investmentsService.getUserInvestments(userId);
      const safeInvestments = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      if (response.success) {
        setInvestments(safeInvestments);
      } else {
        setInvestments([]);
      }
    } catch (err: any) {
      console.error('Error loading investments:', err);
      setError(err?.message || 'Failed to load investments');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadInvestments();
  }, [loadInvestments]);

  const addInvestment = useCallback(
    async (investment: Omit<InvestmentModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        await investmentsService.createInvestment(userId, investment);
        await loadInvestments();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadInvestments]
  );

  const updateInvestment = useCallback(
    async (investmentId: string, investment: Partial<InvestmentModel>) => {
      setSaving(true);
      setError(null);

      try {
        await investmentsService.updateInvestment(investmentId, investment);
        await loadInvestments();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadInvestments]
  );

  const deleteInvestment = useCallback(
    async (investmentId: string) => {
      setSaving(true);
      setError(null);

      try {
        await investmentsService.deleteInvestment(investmentId);
        await loadInvestments();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadInvestments]
  );

  const getTotalStats = useCallback(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalReturn = totalValue - totalInvested;

    return { totalInvested, totalValue, totalReturn };
  }, [investments]);

  return {
    investments,
    loading,
    saving,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getTotalStats,
    reload: loadInvestments,
  };
}
