"use client";

import { useEffect, useState, useCallback } from 'react';
import type { AccountModel } from '@/src/data/mock-accounts';
import {
  listAccounts,
  createAccountFirestore,
  updateAccountFirestore,
  deleteAccountFirestore,
} from '@/services/firestore/accounts.service';

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listAccounts()
      .then((res) => {
        if (!mounted) return;
        setAccounts(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || String(err));
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const create = useCallback(async (a: AccountModel) => {
    // optimistic add
    const tempId = `temp_${Date.now()}`;
    const temp = { ...a, id: tempId };
    setAccounts((s) => [temp, ...s]);
    try {
      const created = await createAccountFirestore({ ...a, id: undefined } as any);
      setAccounts((s) => s.map((it) => (it.id === tempId ? created : it)));
      return created;
    } catch (err: any) {
      // rollback
      setAccounts((s) => s.filter((it) => it.id !== tempId));
      setError(err.message || String(err));
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, patch: Partial<AccountModel>) => {
    const prev = accounts.find((a) => a.id === id);
    setAccounts((s) => s.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    try {
      await updateAccountFirestore(id, patch);
    } catch (err: any) {
      // rollback
      setAccounts((s) => s.map((a) => (a.id === id && prev ? prev : a)));
      setError(err.message || String(err));
      throw err;
    }
  }, [accounts]);

  const remove = useCallback(async (id: string) => {
    const prev = accounts.find((a) => a.id === id);
    setAccounts((s) => s.filter((a) => a.id !== id));
    try {
      await deleteAccountFirestore(id);
    } catch (err: any) {
      // rollback
      if (prev) setAccounts((s) => [prev, ...s]);
      setError(err.message || String(err));
      throw err;
    }
  }, [accounts]);

  return { accounts, loading, error, create, update, remove } as const;
}
