"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { InvestmentModel, InvestmentTransaction } from '@/src/lib/investments';

interface Props {
  investment: InvestmentModel | null;
  transactions: InvestmentTransaction[];
}

function buildSeries(investment: InvestmentModel | null, txs: InvestmentTransaction[]) {
  // Build a cumulative value series over time
  const sorted = [...txs].sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
  const points: { date: string; value: number }[] = [];
  let cumulative = investment?.amountInvested || 0;
  for (const tx of sorted) {
    if (tx.transactionType === 'BUY') cumulative += tx.amount;
    if (tx.transactionType === 'SELL') cumulative -= tx.amount;
    points.push({ date: tx.transactionDate.toISOString().slice(0, 10), value: cumulative });
  }
  // add current
  points.push({ date: 'Now', value: investment?.currentValue || cumulative });
  return points;
}

export default function PerformanceChart({ investment, transactions }: Props) {
  const data = useMemo(() => buildSeries(investment, transactions), [investment, transactions]);

  return (
    <div className="bg-[#151A20] rounded-[28px] p-4 h-72">
      <div className="mb-2 text-sm text-gray-400">Performance</div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0b0d10" />
          <XAxis dataKey="date" stroke="#88929b" />
          <YAxis stroke="#88929b" />
          <Tooltip wrapperStyle={{ background: '#0b0d10', borderRadius: 8 }} />
          <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} dot={false} strokeLinecap="round" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
