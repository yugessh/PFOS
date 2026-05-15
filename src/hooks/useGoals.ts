'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { goalsService } from '@/src/services/firestore/goals.service';
import { calculateGoalProgress } from '@/src/lib/goals';
import type { GoalModel } from '@/src/lib/goals';

export function useGoals() {
  const auth = useAuthContext();
  const [goals, setGoals] = useState<GoalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await goalsService.getUserGoals(userId);
      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        setGoals([]);
      }
    } catch (err: any) {
      console.error('Error loading goals:', err);
      setError(err?.message || 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const addGoal = useCallback(
    async (goal: Omit<GoalModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => {
      const userId = auth?.user?.uid;
      if (!userId) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);

      try {
        await goalsService.createGoal(userId, goal);
        await loadGoals();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [auth?.user?.uid, loadGoals]
  );

  const updateGoal = useCallback(
    async (goalId: string, goal: Partial<GoalModel>) => {
      setSaving(true);
      setError(null);

      try {
        await goalsService.updateGoal(goalId, goal);
        await loadGoals();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadGoals]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      setSaving(true);
      setError(null);

      try {
        await goalsService.deleteGoal(goalId);
        await loadGoals();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadGoals]
  );

  const updateSavedAmount = useCallback(
    async (goalId: string, amount: number) => {
      setSaving(true);
      setError(null);

      try {
        await goalsService.updateSavedAmount(goalId, amount);
        await loadGoals();
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadGoals]
  );

  const getGoalStats = useCallback(() => {
    const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return { completed, totalTarget, totalSaved, overallProgress, total: goals.length };
  }, [goals]);

  return {
    goals,
    loading,
    saving,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSavedAmount,
    getGoalStats,
    reload: loadGoals,
  };
}
