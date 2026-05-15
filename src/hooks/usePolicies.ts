'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { policiesService } from '@/src/services/firestore/policies.service';
import type { PolicyModel } from '@/src/lib/policies';

export function usePolicies() {
  const auth = useAuthContext();
  const [policies, setPolicies] = useState<PolicyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await policiesService.getUserPolicies(userId);
      if (response.success && response.data) {
        setPolicies(response.data);
      } else {
        setPolicies([]);
      }
    } catch (err: any) {
      console.error('Error loading policies:', err);
      setError(err?.message || 'Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  const addPolicy = useCallback(
    async (policy: Omit<PolicyModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        await policiesService.createPolicy(userId, policy);
        await loadPolicies();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadPolicies]
  );

  const updatePolicy = useCallback(
    async (policyId: string, policy: Partial<PolicyModel>) => {
      setSaving(true);
      setError(null);

      try {
        await policiesService.updatePolicy(policyId, policy);
        await loadPolicies();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadPolicies]
  );

  const deletePolicy = useCallback(
    async (policyId: string) => {
      setSaving(true);
      setError(null);

      try {
        await policiesService.deletePolicy(policyId);
        await loadPolicies();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadPolicies]
  );

  return {
    policies,
    loading,
    saving,
    error,
    addPolicy,
    updatePolicy,
    deletePolicy,
    reload: loadPolicies,
  };
}
