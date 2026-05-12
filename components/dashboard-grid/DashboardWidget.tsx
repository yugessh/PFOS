import { cn } from '@/lib/utils';
import {
  dashboardColSpanClass,
  dashboardFullWidthColClass,
  dashboardRowSpanClass,
} from './span-classes';
import type { DashboardWidgetProps } from './types';

export function DashboardWidget({
  title,
  description,
  children,
  className,
  colSpan,
  rowSpan,
}: DashboardWidgetProps) {
  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col gap-3',
        colSpan != null ? dashboardColSpanClass[colSpan] : dashboardFullWidthColClass,
        rowSpan != null ? dashboardRowSpanClass[rowSpan] : null,
        className
      )}
    >
      {(title != null || description != null) && (
        <header className="space-y-0.5">
          {title != null ? (
            <h3 className="text-sm font-semibold leading-none text-foreground">{title}</h3>
          ) : null}
          {description != null ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>
      )}
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
