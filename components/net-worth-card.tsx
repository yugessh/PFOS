'use client';

import { TrendingUp } from 'lucide-react';
import { Account, Investment } from '@/lib/types';

interface NetWorthCardProps {
  accounts: Account[];
  investments: Investment[];
}

export function NetWorthCard({ accounts, investments }: NetWorthCardProps) {
  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0) + 
                      investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalReturns = investments.reduce((sum, inv) => sum + inv.returns, 0);

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6 border border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-primary-foreground/80 mb-2">Net Worth</p>
          <h2 className="text-3xl font-bold">₹{(totalAssets / 100000).toFixed(2)}L</h2>
        </div>
        <div className="p-3 bg-primary-foreground/10 rounded-lg">
          <TrendingUp size={24} className="text-primary-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-primary-foreground/80 mb-1">Total Assets</p>
          <p className="font-bold">₹{(totalAssets / 100000).toFixed(1)}L</p>
        </div>
        <div>
          <p className="text-xs text-primary-foreground/80 mb-1">Invested</p>
          <p className="font-bold">₹{(totalInvested / 100000).toFixed(1)}L</p>
        </div>
        <div>
          <p className="text-xs text-primary-foreground/80 mb-1">Returns</p>
          <p className="font-bold text-green-300">+₹{(totalReturns / 1000).toFixed(0)}K</p>
        </div>
      </div>
    </div>
  );
}
