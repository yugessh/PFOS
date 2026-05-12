import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { StatCardTrend } from './types';

export const statCardTrendConfig: Record<
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
