"use client";

import React from 'react';
import { calculateInvestmentReturn, getInvestmentTypeLabel } from '@/src/lib/investments';
import type { InvestmentModel } from '@/src/lib/investments';

export default function InvestmentCard({ investment, onOpen }: { investment: InvestmentModel; onOpen?: () => void }) {
  const { gain, gainPercent } = calculateInvestmentReturn(investment as any);
  const isProfit = gain >= 0;

  return (
    <div style={{ background: '#151A20', borderRadius: 28, padding: 16, color: '#fff', width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{investment.name}</div>
          <div style={{ color: '#9aa2a9', fontSize: 12 }}>{getInvestmentTypeLabel(investment.type)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700 }}>₹{investment.currentValue.toLocaleString()}</div>
          <div style={{ color: isProfit ? '#7EE7C7' : '#FF6B6B' }}>{isProfit ? '+' : ''}₹{gain.toLocaleString()} • {gainPercent.toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9aa2a9' }}>Quantity</div>
          <div style={{ fontWeight: 700 }}>{investment.quantity ?? '-'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#9aa2a9' }}>Invested</div>
          <div style={{ fontWeight: 700 }}>₹{investment.amountInvested.toLocaleString()}</div>
        </div>
        <div>
          <button onClick={onOpen} style={{ background: '#22262a', color: '#fff', borderRadius: 12, padding: '8px 12px', border: 'none' }}>Details</button>
        </div>
      </div>
    </div>
  );
}
