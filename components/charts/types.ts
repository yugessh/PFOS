import type { ReactNode } from 'react';

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Header control(s), e.g. period selector or export button */
  action?: ReactNode;
  /** Optional footnote, legend summary, or metadata */
  footer?: ReactNode;
  className?: string;
}
