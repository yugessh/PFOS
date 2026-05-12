'use client';

import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={cn('bg-card rounded-lg p-6 border border-border', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-card-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
