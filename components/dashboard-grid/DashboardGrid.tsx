import { cn } from '@/lib/utils';
import type { DashboardGridProps } from './types';

const gapClass: Record<NonNullable<DashboardGridProps['gap']>, string> = {
  sm: 'gap-3 md:gap-4',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8',
};

export function DashboardGrid({ children, className, gap = 'md' }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 md:grid-cols-6 lg:grid-cols-12',
        'auto-rows-min',
        gapClass[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
