'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { categoriesService } from '@/src/services/firestore/categories.service';
import type { Category, CategoryType } from '@/lib/categories';

function normalizeCategoryType(value: unknown): CategoryType {
  return value === 'income' || value === 'transfer' ? value : 'expense';
}

function toCategory(record: any): Category {
  return {
    id: String(record.id || ''),
    name: String(record.name || 'Untitled Category'),
    type: normalizeCategoryType(record.type),
    parentId: record.parentId || null,
    color: record.color || '#7EE7C7',
    icon: record.icon || '🏷️',
  };
}

export function useCategories() {
  const { user } = useAuthContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const userId = user?.uid;
    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await categoriesService.getUserCategories(userId);
      const rows = response.success
        ? Array.isArray(response.data?.data)
          ? response.data.data
          : []
        : [];

      setCategories(rows.map((row) => toCategory(row)));

      if (!response.success && response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(
    async (payload: Omit<Category, 'id'>) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      setSaving(true);
      setError(null);

      try {
        const response = await categoriesService.create({
          userId: user.uid,
          name: payload.name,
          type: payload.type,
          parentId: payload.parentId || null,
          color: payload.color || '#7EE7C7',
          icon: payload.icon || '🏷️',
          isActive: true,
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create category');
        }

        const created = toCategory(response.data);
        setCategories((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        const message = err?.message || 'Failed to create category';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [user?.uid]
  );

  const byType = useMemo(
    () => ({
      expense: categories.filter((category) => category.type === 'expense'),
      income: categories.filter((category) => category.type === 'income'),
      transfer: categories.filter((category) => category.type === 'transfer'),
    }),
    [categories]
  );

  return {
    categories,
    byType,
    loading,
    saving,
    error,
    addCategory,
    reload: loadCategories,
  };
}
