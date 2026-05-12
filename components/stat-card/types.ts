import type { ReactNode } from 'react';

export type StatCardTrend = 'positive' | 'negative' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  /** Display text for period-over-period or contextual change, e.g. "+8.2% vs last month" */
  change?: string;
  icon?: ReactNode;
  trend: StatCardTrend;
  /** Supporting line shown under the change row */
  description?: string;
  className?: string;
}
