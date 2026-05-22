"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  const { netWorthData, history: netHistory, loading: netLoading } = useNetWorth();
  const { transactions, loading: txLoading } = useTransactions();
  const { trades, stats: tradingStats, loading: tradingLoading } = useTradingJournal();

  const cashflow = React.useMemo(() => {
    const map: Record<string, number> = {};
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    transactions.forEach((t: any) => {
      const key = new Date(t.date).toISOString().slice(0, 10);
      if (map[key] === undefined) map[key] = 0;
      map[key] += t.amount || 0;
    });
    return Object.keys(map).map((k) => ({ date: k, value: map[k] }));
  }, [transactions]);

  return (
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-secondary mt-2">Centralized financial intelligence & reports</p>
        </motion.div>

        <div className="mt-6 grid gap-5 grid-cols-1 lg:grid-cols-3">
          <AnalyticsCard title={`Net worth: $${(netWorthData.netWorth || 0).toFixed(2)}`} subtitle="Net Worth Analytics">
            {netLoading ? (
              <div>Loading…</div>
            ) : (
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netHistory.map((h: any) => ({ month: h.month, value: h.netWorth }))}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7EE7C7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#151A20" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: '#9AA0A6' }} />
                    <YAxis tick={{ fill: '#9AA0A6' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#7EE7C7" fill="url(#netGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard title="Cashflow" subtitle="Cashflow Analytics">
            {txLoading ? (
              <div>Loading…</div>
            ) : (
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflow}>
                    <XAxis dataKey="date" tick={{ fill: '#9AA0A6' }} />
                    <YAxis tick={{ fill: '#9AA0A6' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#7EE7C7" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard title={`Trading P/L: ${tradingStats.totalPnl ?? 0}`} subtitle="Trading Analytics">
            {tradingLoading ? (
              <div>Loading…</div>
            ) : (
              <div className="text-sm text-secondary">
                <div>Total trades: {tradingStats.total}</div>
                <div>Win rate: {tradingStats.winRate?.toFixed(1)}%</div>
                <div>Total P&L: {tradingStats.totalPnl}</div>
              </div>
            )}
          </AnalyticsCard>
        </div>

        <div className="mt-6 grid gap-5 grid-cols-1 lg:grid-cols-2">
          <AnalyticsCard title="Budget Overview" subtitle="Budget Analytics">
            <div className="text-sm text-secondary">Budget summaries and efficiency charts coming soon.</div>
          </AnalyticsCard>

          <AnalyticsCard title="Goals & Progress" subtitle="Goal Analytics">
            <div className="text-sm text-secondary">Goal completion and timelines coming soon.</div>
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
}
