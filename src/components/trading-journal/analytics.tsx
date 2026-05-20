"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import type { TradeRecord } from '@/src/services/firestore/tradingJournal.service';

interface Props {
  trades: TradeRecord[];
}

const COLORS = ['#10B981', '#EF4444'];

export default function JournalAnalytics({ trades }: Props) {
  const pnlSeries = trades.slice().reverse().map(t => ({ date: new Date(t.date).toISOString().slice(0,10), pnl: Number(t.pnl ?? ((t.exitPrice ?? t.sellPrice ?? 0) - (t.entryPrice ?? t.buyPrice ?? 0)) * (t.quantity ?? 1)) }));
  const wins = trades.filter(t => (t.pnl ?? ((t.exitPrice ?? t.sellPrice ?? 0) - (t.entryPrice ?? t.buyPrice ?? 0)) * (t.quantity ?? 1)) > 0).length;
  const losses = trades.length - wins;

  return (
    <div className="bg-[#151A20] rounded-[28px] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ height: 180 }}>
          <div className="text-sm text-gray-400 mb-2">P/L Curve</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pnlSeries}>
              <XAxis dataKey="date" stroke="#88929b" />
              <YAxis stroke="#88929b" />
              <Tooltip wrapperStyle={{ background: '#0b0d10', borderRadius: 8 }} />
              <Line type="monotone" dataKey="pnl" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col">
          <div className="text-sm text-gray-400 mb-2">Win vs Loss</div>
          <div className="flex items-center gap-4">
            <div style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Win', value: wins }, { name: 'Loss', value: losses }]} dataKey="value" innerRadius={30} outerRadius={50}>
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-sm">Wins: <span className="font-semibold">{wins}</span></div>
              <div className="text-sm">Losses: <span className="font-semibold">{losses}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
