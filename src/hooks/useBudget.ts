'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import {
  budgetCategoryService,
  budgetTrackingService,
  budgetAlertService,
} from '@/src/services/firestore/budget.service';

interface BudgetItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
  status: 'healthy' | 'warning' | 'exceeded';
}

interface BudgetAlert {
  id: string;
  category: string;
  threshold: number; // 80, 90, 100
  percentUsed: number;
  spent: number;
  limit: number;
  status: 'pending' | 'sent' | 'read';
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  healthScore: number; // 0-100
}

/**
 * Hook for Budget System
 * Tracks budgets and sends smart alerts
 */
export function useBudget() {
  const { user } = useAuthContext();

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    healthScore: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current month budgets
      const month = new Date().toISOString().slice(0, 7);
      const result = await budgetTrackingService.getMonthlyBudgets(user.uid, month);

      if (result.success && result.data) {
        const budgetItems = (result.data || []).map((tracking: any) => ({
          id: tracking.id,
          category: tracking.category,
          limit: tracking.limit,
          spent: tracking.spent,
          remaining: tracking.remaining,
          percentUsed: Math.round((tracking.spent / tracking.limit) * 100),
          isExceeded: tracking.isExceeded,
          status: (
            tracking.spent >= tracking.limit
              ? 'exceeded'
              : tracking.spent / tracking.limit > 0.8
                ? 'warning'
                : 'healthy'
          ) as 'healthy' | 'warning' | 'exceeded',
        }));

        setBudgets(budgetItems);

        // Calculate summary
        const totalBudget = budgetItems.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = budgetItems.reduce((sum, b) => sum + b.spent, 0);
        const totalRemaining = budgetItems.reduce((sum, b) => sum + b.remaining, 0);
        const healthScore = await budgetTrackingService.calculateHealthScore(result.data);

        setSummary({
          totalBudget,
          totalSpent,
          totalRemaining,
          healthScore: Math.round(healthScore),
        });
      }

      // Get pending alerts
      const alertsResult = await budgetAlertService.getPendingAlerts(user.uid);
      if (alertsResult.success && alertsResult.data) {
        setAlerts(alertsResult.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load budgets');
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets, user?.uid]);

  const createBudget = useCallback(
    async (category: string, limit: number, alertThreshold: number = 80) => {
      if (!user?.uid) return { success: false };

      try {
        return await budgetCategoryService.createBudgetCategory(
          user.uid,
          category,
          limit,
          alertThreshold
        );
      } catch (err: any) {
        console.error('Error creating budget:', err);
        return { success: false, error: err.message };
      }
    },
    [user?.uid]
  );

  const updateBudgetSpent = useCallback(
    async (budgetId: string, spent: number, threshold: number = 80) => {
      try {
        // This would integrate with real spending data from transactions
        return await budgetTrackingService.updateSpent(budgetId, spent, threshold);
      } catch (err: any) {
        console.error('Error updating budget:', err);
        return { success: false, error: err.message };
      }
    },
    []
  );

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      return await budgetAlertService.markAsRead(alertId);
    } catch (err: any) {
      console.error('Error dismissing alert:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const refresh = useCallback(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    alerts,
    summary,
    loading,
    error,
    createBudget,
    updateBudgetSpent,
    dismissAlert,
    refresh,
  };
}
