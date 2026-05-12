import type { ReactNode } from 'react';

/** Column span units for the 12-column desktop grid (mapped to 6 columns on `md`). */
export type DashboardSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DashboardRowSpan = 1 | 2 | 3 | 4 | 5 | 6;

export type DashboardGridGap = 'sm' | 'md' | 'lg';

export interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  gap?: DashboardGridGap;
}

export interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  colSpan?: DashboardSpan;
  rowSpan?: DashboardRowSpan;
}

export interface DashboardWidgetProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  colSpan?: DashboardSpan;
  rowSpan?: DashboardRowSpan;
}
