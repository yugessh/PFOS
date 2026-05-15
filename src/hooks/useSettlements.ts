'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { settlementsService } from '@/src/services/firestore/settlements.service';
import { calculateSettlementSummary } from '@/src/lib/settlements';
import type { SettlementModel } from '@/src/lib/settlements';

export function useSettlements() {
  const auth = useAuthContext();
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
      if (process.env.NODE_ENV === 'development') {
        console.log('settlements type:', typeof response.data, response.data);
      }

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

  const markAsPaid = useCallback(
    async (settlementId: string) => {
      setSaving(true);
      setError(null);

      try {
        await settlementsService.markAsPaid(settlementId);
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

  const getSummary = useCallback(() => {
    return calculateSettlementSummary(settlements);
  }, [settlements]);

  return {
    settlements,
    loading,
    saving,
    error,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    markAsPaid,
    getSummary,
    reload: loadSettlements,
  };
}
