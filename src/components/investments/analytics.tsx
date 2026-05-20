"use client";

import React, { useMemo } from 'react';
import type { InvestmentModel, InvestmentTransaction } from '@/src/lib/investments';

interface Props {
  investment: InvestmentModel | null;
  transactions: InvestmentTransaction[];
}

export default function Analytics({ investment, transactions }: Props) {
  const stats = useMemo(() => {
    if (!investment) return null;
    const totalQty = investment.quantity || transactions.reduce((s, t) => s + (t.quantity || 0) * (t.transactionType === 'BUY' ? 1 : -1), 0);
    const avgPrice = investment.quantity && investment.quantity > 0 ? investment.amountInvested / investment.quantity : investment.purchasePrice || 0;
    const unrealized = (investment.currentValue || 0) - (investment.amountInvested || 0);
    const allocationPct = 0; // calculation requires portfolio totals — computed elsewhere
    return { totalQty, avgPrice, unrealized, allocationPct };
  }, [investment, transactions]);

  if (!investment) return null;

  return (
    <div className="bg-[#151A20] rounded-[28px] p-4">
      <div className="text-sm text-gray-400 mb-3">Analytics</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400">Quantity</div>
          <div className="font-semibold">{stats?.totalQty ?? '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Avg Buy Price</div>
          <div className="font-semibold">₹{stats?.avgPrice?.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Unrealized</div>
          <div className="font-semibold">₹{stats?.unrealized?.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Allocation</div>
          <div className="font-semibold">{(stats?.allocationPct * 100 || 0).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}
