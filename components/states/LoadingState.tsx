import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { LoadingStateType } from './types';

export interface LoadingStateProps {
  type: LoadingStateType;
  /** Row count for `table` layout (default 5). */
  rows?: number;
  className?: string;
}

const BAR_HEIGHTS = [42, 68, 55, 80, 63, 72, 58];

export function LoadingState({ type, rows = 5, className }: LoadingStateProps) {
  const rowCount = Math.max(1, Math.min(rows, 24));

  if (type === 'page') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 py-10 sm:py-14',
          className
        )}
        role="status"
        aria-busy="true"
        aria-label="Loading"
      >
        <Spinner className="size-8 text-primary" />
        <div className="flex w-full max-w-xs flex-col items-center gap-2">
          <Skeleton className="h-4 w-3/4 max-w-[12rem]" />
          <Skeleton className="h-3 w-1/2 max-w-[8rem]" />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div
        className={cn('overflow-hidden rounded-lg border border-border/80 dark:border-border/60', className)}
        role="status"
        aria-busy="true"
        aria-label="Loading table"
      >
        <div className="flex gap-3 border-b border-border/60 bg-muted/25 px-3 py-2.5 dark:border-border/50 dark:bg-muted/20">
          <Skeleton className="h-3 min-w-0 flex-[2]" />
          <Skeleton className="h-3 min-w-0 flex-1" />
          <Skeleton className="h-3 min-w-0 flex-1" />
          <Skeleton className="h-3 min-w-0 flex-1 max-sm:hidden" />
        </div>
        <div className="divide-y divide-border/50 dark:divide-border/40">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-4 min-w-0 flex-[2]" />
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton className="h-4 min-w-0 flex-1 max-sm:hidden" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div
        className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}
        role="status"
        aria-busy="true"
        aria-label="Loading dashboard cards"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl sm:h-24" />
        ))}
      </div>
    );
  }

  /* analytics */
  return (
    <div
      className={cn('space-y-4 rounded-lg border border-border/80 p-4 dark:border-border/60', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading chart"
    >
      <Skeleton className="h-48 w-full rounded-lg sm:h-56" />
      <div className="flex h-28 items-end justify-between gap-1.5 sm:gap-2 sm:h-32">
        {BAR_HEIGHTS.map((pct, i) => (
          <Skeleton
            key={i}
            className="min-h-[18%] flex-1 rounded-t-md"
            style={{ height: `${pct}%` }}
          />
        ))}
      </div>
    </div>
  );
}
