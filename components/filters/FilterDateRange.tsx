'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FilterDateRangeProps {
  label?: string;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
  idFrom?: string;
  idTo?: string;
}

export function FilterDateRange({
  label = 'Date range',
  from,
  to,
  onFromChange,
  onToChange,
  className,
  idFrom = 'filter-date-from',
  idTo = 'filter-date-to',
}: FilterDateRangeProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor={idFrom} className="sr-only">
            Start date
          </Label>
          <Input
            id={idFrom}
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="h-8 w-[11rem] shrink-0 font-mono text-xs sm:text-sm"
          />
        </div>
        <span className="hidden text-muted-foreground sm:inline" aria-hidden>
          –
        </span>
        <div className="flex flex-col gap-1">
          <Label htmlFor={idTo} className="sr-only">
            End date
          </Label>
          <Input
            id={idTo}
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="h-8 w-[11rem] shrink-0 font-mono text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
