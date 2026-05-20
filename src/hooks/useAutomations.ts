'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { automationsService } from '@/src/services/firestore/automation.service';
import type { AutomationModel } from '@/src/lib/automation';

export function useAutomations() {
  const auth = useAuthContext();
  const userId = auth?.user?.uid;
  const [automations, setAutomations] = useState<AutomationModel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await automationsService.getUserAutomations(userId);
      const items = res.success ? res.data || [] : [];
      setAutomations(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (payload: Omit<AutomationModel, 'id' | 'createdAt'>) => {
    if (!userId) throw new Error('Not authenticated');
    await automationsService.createAutomation(userId, payload as any);
    await load();
  }, [userId, load]);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    await automationsService.updateAutomation(id, { enabled });
    await load();
  }, [load]);

  return { automations, loading, reload: load, create, toggle };
}
