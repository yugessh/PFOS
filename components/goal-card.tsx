'use client';

import type { SavingsGoal } from '@/types';
import { Target } from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{goal.category}</p>
          <h3 className="font-bold text-card-foreground">{goal.name}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Target size={18} className="text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-primary">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-bold text-card-foreground">₹{(goal.currentAmount / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-bold text-card-foreground">₹{(goal.targetAmount / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {daysRemaining} days remaining • ₹{(remaining / 1000).toFixed(1)}K to go
          </p>
        </div>
      </div>
    </div>
  );
}
