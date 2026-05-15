"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection as firestoreCollection, getDocs, query, where } from 'firebase/firestore';
import { useAuthContext } from '@/src/context/AuthContext';
import { getFirestoreClient } from '@/src/services/firestore/firebaseClient';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import {
  DEFAULT_BUDGET_CATEGORY_OPTIONS,
  getBudgetSummary,
  getMonthKey,
  normalizeCategoryKey,
  withBudgetProgress,
  type BudgetModel,
} from '@/src/lib/budgets';
import { budgetsService } from '@/src/services/firestore/budgets.service';
import type { Transaction } from '@/src/types/transaction';

export interface BudgetCategoryOption {
  id: string;
  name: string;
  icon: string;
}

const CATEGORY_ICON_BY_NAME: Record<string, string> = {
  food: '🍽️',
  groceries: '🛒',
  transport: '🛵',
  transportation: '🛵',
  shopping: '🛍️',
  bills: '💡',
  utilities: '💡',
  entertainment: '🎬',
  health: '🏥',
  healthcare: '🏥',
  travel: '✈️',
};

function inferCategoryOption(category: string): BudgetCategoryOption {
  const key = normalizeCategoryKey(category || 'other') || 'other';
  return {
    id: key,
    name: category,
    icon: CATEGORY_ICON_BY_NAME[key] || '📦',
  };
}

export function useBudgets(transactions: Transaction[]) {
  const { user } = useAuthContext();
  const monthKey = getMonthKey();
  const [budgets, setBudgets] = useState<BudgetModel[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<BudgetCategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    if (!user?.uid) {
      setBudgets([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await budgetsService.getUserBudgets(user.uid, monthKey);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch budgets');
      }
      const safeBudgets = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setBudgets(safeBudgets as BudgetModel[]);
    } catch (err: any) {
      setError(err?.message || String(err));
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, monthKey]);

  const loadCategoryOptions = useCallback(async () => {
    if (!user?.uid) {
      setCategoryOptions(DEFAULT_BUDGET_CATEGORY_OPTIONS.map((item) => ({ ...item })));
      return;
    }

    const merged = new Map<string, BudgetCategoryOption>();

    DEFAULT_BUDGET_CATEGORY_OPTIONS.forEach((option) => {
      merged.set(option.id, { ...option });
    });

    const db = getFirestoreClient();
    if (db) {
      const categoriesRef = firestoreCollection(db, SUBCOLLECTIONS.USER_CATEGORIES(user.uid)) as any;
      const categoryQuery = query(categoriesRef, where('type', '==', 'expense'));
      const categorySnap = await getDocs(categoryQuery);
      categorySnap.docs.forEach((entry: any) => {
        const data = entry.data();
        const key = normalizeCategoryKey(data?.name || entry.id) || entry.id;
        merged.set(key, {
          id: key,
          name: data?.name || entry.id,
          icon: data?.icon || CATEGORY_ICON_BY_NAME[key] || '📦',
        });
      });
    }

    transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category)
      .forEach((transaction) => {
        const category = `${transaction.category}`;
        const option = inferCategoryOption(category);
        if (!merged.has(option.id)) {
          merged.set(option.id, option);
        }
      });

    setCategoryOptions(Array.from(merged.values()));
  }, [transactions, user?.uid]);

  useEffect(() => {
    void loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    void loadCategoryOptions();
  }, [loadCategoryOptions]);

  const items = useMemo(() => withBudgetProgress(budgets, transactions), [budgets, transactions]);
  const summary = useMemo(() => getBudgetSummary(items), [items]);

  const saveBudget = useCallback(
    async ({
      categoryId,
      categoryName,
      categoryIcon,
      monthlyLimit,
      currency,
    }: {
      categoryId: string;
      categoryName: string;
      categoryIcon?: string;
      monthlyLimit: number;
      currency: 'INR' | 'USD' | 'EUR' | 'GBP';
    }) => {
      if (!user?.uid) throw new Error('User not authenticated');

      setSaving(true);
      setError(null);
      try {
        const response = await budgetsService.upsertBudget(user.uid, {
          monthKey,
          categoryId,
          categoryName,
          categoryIcon,
          monthlyLimit,
          currency,
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to save budget');
        }

        setBudgets((prev) => {
          const next = prev.filter(
            (budget) => !(budget.categoryId === categoryId && budget.monthKey === monthKey)
          );
          return [...next, response.data as BudgetModel].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
        });
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid, monthKey]
  );

  const removeBudget = useCallback(
    async (budgetId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const response = await budgetsService.removeBudget(user.uid, budgetId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove budget');
      }
      setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
    },
    [user?.uid]
  );

  return {
    budgets,
    budgetItems: items,
    budgetSummary: summary,
    categoryOptions,
    monthKey,
    loading,
    saving,
    error,
    refresh: loadBudgets,
    saveBudget,
    removeBudget,
  };
}
