'use client';

import { Investment } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentCardProps {
  investment: Investment;
}

function getInvestmentIcon(type: string) {
  return <TrendingUp size={18} className="text-primary" />;
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const isPositive = investment.returns >= 0;

  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{investment.type.replace('-', ' ')}</p>
          <h3 className="font-bold text-card-foreground">{investment.name}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          {getInvestmentIcon(investment.type)}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Value</p>
            <p className="text-lg font-bold text-card-foreground">₹{(investment.currentValue / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Invested</p>
            <p className="text-lg font-bold text-muted-foreground">₹{(investment.investedAmount / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Returns</p>
              <p className={cn('font-bold text-sm', isPositive ? 'text-green-600' : 'text-red-600')}>
                ₹{(investment.returns / 1000).toFixed(1)}K
              </p>
            </div>
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg', isPositive ? 'bg-green-100' : 'bg-red-100')}>
              {isPositive ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={cn('text-xs font-bold', isPositive ? 'text-green-600' : 'text-red-600')}>
                {isPositive ? '+' : ''}{investment.returnPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
