'use client';

import type { StatCardProps, StatCardTrend } from './types';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const trendConfig: Record<
  StatCardTrend,
  {
    Icon: typeof ArrowUpRight;
    rowClass: string;
    iconWrapClass: string;
  }
> = {
  positive: {
    Icon: ArrowUpRight,
    rowClass: 'text-emerald-600 dark:text-emerald-400',
    iconWrapClass: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
  negative: {
    Icon: ArrowDownRight,
    rowClass: 'text-rose-600 dark:text-rose-400',
    iconWrapClass: 'bg-rose-500/10 dark:bg-rose-400/10',
  },
  neutral: {
    Icon: Minus,
    rowClass: 'text-muted-foreground',
    iconWrapClass: 'bg-muted',
  },
};

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  const { Icon: TrendIcon, rowClass, iconWrapClass } = trendConfig[trend];

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-md',
        'dark:border-border/80 dark:hover:border-primary/25',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="truncate text-2xl font-semibold tracking-tight text-card-foreground tabular-nums">
            {value}
          </p>
        </div>
        {icon ? (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
              'transition-colors group-hover:bg-primary/15 dark:bg-primary/15 dark:group-hover:bg-primary/20'
            )}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>

      {(change || description) && (
        <div className="space-y-2 border-t border-border/60 pt-3 dark:border-border/80">
          {change ? (
            <div className={cn('flex items-center gap-1.5 text-sm font-medium', rowClass)}>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-md',
                  iconWrapClass
                )}
              >
                <TrendIcon className="size-3.5 stroke-[2.5]" aria-hidden />
              </span>
              <span className="leading-snug">{change}</span>
            </div>
          ) : null}
          {description ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
