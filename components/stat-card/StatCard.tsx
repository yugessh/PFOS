'use client';

import type { StatCardProps } from './types';
import { statCardTrendConfig } from './trend-config';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  const { Icon: TrendIcon, rowClass, iconWrapClass } = statCardTrendConfig[trend];

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 focus-within:ring-offset-background',
        'dark:border-border/80 dark:hover:border-primary/25 dark:focus-within:ring-offset-background',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="truncate text-2xl font-semibold tracking-tight text-card-foreground tabular-nums sm:text-[1.65rem]">
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
