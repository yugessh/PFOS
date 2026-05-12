import { cn } from '@/lib/utils';
import { dashboardColSpanClass, dashboardRowSpanClass } from './span-classes';
import type { DashboardSectionProps } from './types';

export function DashboardSection({
  title,
  description,
  children,
  className,
  colSpan,
  rowSpan,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        'min-w-0 space-y-4',
        colSpan != null ? dashboardColSpanClass[colSpan] : null,
        rowSpan != null ? dashboardRowSpanClass[rowSpan] : null,
        className
      )}
    >
      {(title != null || description != null) && (
        <header className="space-y-1">
          {title != null ? (
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          ) : null}
          {description != null ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}
