'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { emiService } from '@/src/services/firestore/emi.service';
import { getEMIAlerts, calculateEMIProgress, type EMIModel, type EMIAlert } from '@/src/lib/emi';

export function useEMI() {
  const auth = useAuthContext();
  const [emis, setEmis] = useState<EMIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEMIs = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setEmis([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emiService.getUserEMIs(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load EMIs');
      }

      setEmis(response.data?.data || []);
    } catch (err: any) {
      setError(err?.message || String(err));
      setEmis([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadEMIs();
  }, [loadEMIs]);

  const saveEMI = useCallback(
    async (payload: Omit<EMIModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await emiService.upsertEMI(userId, payload);
        if (!response.success) {
          throw new Error(response.error || 'Failed to save EMI');
        }

        await loadEMIs();
        return response.data;
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadEMIs]
  );

  const removeEMI = useCallback(
    async (emiId: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await emiService.removeEMI(userId, emiId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to remove EMI');
        }

        await loadEMIs();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadEMIs]
  );

  const markEMIPaid = useCallback(
    async (emiId: string, installmentNumber: number, transactionId?: string) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        const response = await emiService.markEMIPaid(userId, emiId, installmentNumber, transactionId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to mark EMI as paid');
        }

        await loadEMIs();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadEMIs]
  );

  const emiAlerts = useMemo(() => getEMIAlerts(emis), [emis]);

  const emiProgress = useMemo(() => {
    return emis.map((emi) => ({
      ...emi,
      progress: calculateEMIProgress(emi),
    }));
  }, [emis]);

  return {
    emis,
    emiProgress,
    emiAlerts,
    loading,
    saving,
    error,
    saveEMI,
    removeEMI,
    markEMIPaid,
    reloadEMIs: loadEMIs,
  };
}