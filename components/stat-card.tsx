'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'danger';
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const isPositive = change && change > 0;

  return (
    <div
      className={cn(
        'bg-card rounded-lg p-6 border border-border',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-card-foreground mb-2">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUp size={14} className="text-green-600" />
              ) : (
                <ArrowDown size={14} className="text-red-600" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change)}% {changeLabel || 'change'}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <div className="text-primary">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
