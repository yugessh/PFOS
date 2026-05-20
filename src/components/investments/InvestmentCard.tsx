"use client";

import React from 'react';
import { calculateInvestmentReturn, getInvestmentTypeLabel } from '@/src/lib/investments';
import type { InvestmentModel } from '@/src/lib/investments';

import BuyAssetModal from './BuyAssetModal';
import SellAssetModal from './SellAssetModal';
import { useState } from 'react';

export default function InvestmentCard({ investment, onOpen }: { investment: InvestmentModel; onOpen?: () => void }) {
  const { gain, gainPercent } = calculateInvestmentReturn(investment as any);
  const isProfit = gain >= 0;
  const [showBuy, setShowBuy] = useState(false);
  const [showSell, setShowSell] = useState(false);

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBuy(true)} style={{ background: 'transparent', border: '1px solid rgba(126,231,199,0.18)', color: '#7EE7C7', padding: '8px 12px', borderRadius: 12 }}>Buy</button>
          <button onClick={() => setShowSell(true)} style={{ background: '#22262a', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 12 }}>Sell</button>
        </div>
      </div>

      {showBuy && <div style={{ position: 'fixed', right: 20, bottom: 20 }}><BuyAssetModal investment={investment} onClose={() => setShowBuy(false)} onDone={() => setShowBuy(false)} /></div>}
      {showSell && <div style={{ position: 'fixed', right: 20, bottom: 20 }}><SellAssetModal investment={investment} onClose={() => setShowSell(false)} onDone={() => setShowSell(false)} /></div>}
    </div>
  );
}
