'use client';

import { EMI } from '@/lib/types';
import { TrendingDown } from 'lucide-react';

interface EMIProgressCardProps {
  emi: EMI;
}

export function EMIProgressCard({ emi }: EMIProgressCardProps) {
  const progress = ((emi.principalAmount - emi.remainingAmount) / emi.principalAmount) * 100;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{emi.name}</p>
          <h4 className="font-bold text-card-foreground">₹{(emi.monthlyPayment / 1000).toFixed(1)}K/month</h4>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingDown size={16} className="text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-primary">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-bold text-card-foreground">₹{(emi.remainingAmount / 100000).toFixed(2)}L</p>
          </div>
          <div>
            <p className="text-muted-foreground">Months Left</p>
            <p className="font-bold text-card-foreground">{emi.monthsRemaining}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
