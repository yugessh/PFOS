'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { tradingJournalService, type TradeRecord } from '@/src/services/firestore/tradingJournal.service';

export function useTradingJournal() {
  const auth = useAuthContext();
  const userId = auth?.user?.uid;
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await tradingJournalService.getUserTrades(userId);
      const items = res.success ? res.data || [] : [];
      setTrades(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => {
    const total = trades.length;
    let wins = 0;
    let totalPnl = 0;
    let avgRR = 0;
    let rrCount = 0;
    trades.forEach(t => {
      const pnl = typeof t.pnl === 'number' ? t.pnl : ((t.exitPrice ?? t.sellPrice ?? 0) - (t.entryPrice ?? t.buyPrice ?? 0)) * (t.quantity ?? 1);
      if (pnl > 0) wins++;
      totalPnl += pnl;
      if (typeof t.riskReward === 'number') { avgRR += t.riskReward; rrCount++; }
    });
    const winRate = total === 0 ? 0 : (wins / total) * 100;
    const averageRR = rrCount === 0 ? 0 : avgRR / rrCount;
    return { total, wins, winRate, totalPnl, averageRR };
  }, [trades]);

  return { trades, loading, reload: load, stats };
}
