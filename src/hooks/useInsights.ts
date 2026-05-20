'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { aiInsightsService } from '@/src/services/firestore/aiInsights.service';
import type { InsightModel } from '@/src/lib/insights';

export function useInsights() {
  const auth = useAuthContext();
  const userId = auth?.user?.uid;
  const [insights, setInsights] = useState<InsightModel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await aiInsightsService.getUserInsights(userId);
      const items = res.success ? res.data || [] : [];
      setInsights(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const generateInsight = useCallback(async (insight: Omit<InsightModel, 'id' | 'createdAt'>) => {
    if (!userId) throw new Error('Not authenticated');
    const res: any = await aiInsightsService.createInsight(userId, insight as any);
    await load();
    return res;
  }, [userId, load]);

  const dismiss = useCallback(async (id: string) => {
    await aiInsightsService.dismissInsight(id);
    await load();
  }, [load]);

  return { insights, loading, reload: load, generateInsight, dismiss };
}
