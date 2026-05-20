"use client";

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import type { InvestmentModel } from '@/src/lib/investments';

interface Props {
  investment: InvestmentModel | null;
  loading?: boolean;
  stats?: { avgPrice: number; gain: number; gainPct: number } | null;
}

export default function PortfolioHero({ investment, loading, stats }: Props) {
  const bg = 'bg-[#151A20]';
  const card = 'rounded-[28px] p-6';

  if (loading) {
    return <div className={`${bg} ${card} h-36 animate-pulse`} />;
  }

  if (!investment) {
    return (
      <div className={`${bg} ${card}`}>
        <div className="text-sm text-gray-400">Asset not found</div>
      </div>
    );
  }

  const profitClass = stats && stats.gain >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <motion.div className={`${bg} ${card} flex items-center justify-between`} layout>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold">{investment.name?.charAt(0) ?? '?'}</div>
        <div>
          <div className="text-xl font-semibold">{investment.name}</div>
          <div className="text-sm text-gray-400">{investment.type}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm text-gray-400">Current Value</div>
        <div className="text-2xl font-semibold">
          <CountUp end={investment.currentValue || 0} separator="," decimals={2} prefix="₹" />
        </div>
        <div className="mt-2 text-sm text-gray-400">Invested: <span className="text-white">₹{investment.amountInvested?.toFixed(2)}</span></div>
        <div className={`${profitClass} mt-1`}>Gain: ₹{stats?.gain.toFixed(2)} ({stats?.gainPct.toFixed(2)}%)</div>
        <div className="text-sm text-gray-400">Qty: {investment.quantity ?? '-' } • Avg: ₹{stats?.avgPrice.toFixed(2)}</div>
      </div>
    </motion.div>
  );
}
