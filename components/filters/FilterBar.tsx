'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import { FilterDateRange } from './FilterDateRange';
import { FilterSearch } from './FilterSearch';
import { FilterSelect } from './FilterSelect';
import type { FilterBarProps, FinanceFilters } from './types';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
] as const;

export function FilterBar({
  filters,
  onChange,
  onReset,
  categoryOptions,
  accountOptions,
  className,
}: FilterBarProps) {
  const patch = (partial: Partial<FinanceFilters>) => onChange({ ...filters, ...partial });

  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-muted/20 px-3 py-3 dark:border-border/60 sm:px-4',
        className
      )}
      role="region"
      aria-label="Transaction filters"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSearch value={filters.search} onChange={(search) => patch({ search })} />

          <FilterDateRange
            from={filters.dateFrom}
            to={filters.dateTo}
            onFromChange={(dateFrom) => patch({ dateFrom })}
            onToChange={(dateTo) => patch({ dateTo })}
          />

          <FilterSelect
            label="Category"
            value={filters.category}
            options={categoryOptions}
            onValueChange={(category) => patch({ category })}
            id="filter-category"
          />

          <FilterSelect
            label="Account"
            value={filters.account}
            options={accountOptions}
            onValueChange={(account) => patch({ account })}
            id="filter-account"
          />

          <FilterSelect
            label="Type"
            value={filters.transactionType}
            options={[...TYPE_OPTIONS]}
            onValueChange={(transactionType) =>
              patch({
                transactionType:
                  transactionType === 'income' || transactionType === 'expense'
                    ? transactionType
                    : 'all',
              })
            }
            id="filter-type"
          />

          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Amount</span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="filter-amount-min" className="sr-only">
                  Minimum amount
                </Label>
                <Input
                  id="filter-amount-min"
                  inputMode="decimal"
                  placeholder="Min"
                  value={filters.amountMin}
                  onChange={(e) => patch({ amountMin: e.target.value })}
                  className="h-8 w-[6.5rem] font-mono text-xs sm:text-sm"
                />
              </div>
              <span className="text-muted-foreground text-xs" aria-hidden>
                –
              </span>
              <div className="flex flex-col gap-1">
                <Label htmlFor="filter-amount-max" className="sr-only">
                  Maximum amount
                </Label>
                <Input
                  id="filter-amount-max"
                  inputMode="decimal"
                  placeholder="Max"
                  value={filters.amountMax}
                  onChange={(e) => patch({ amountMax: e.target.value })}
                  className="h-8 w-[6.5rem] font-mono text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 sm:ml-auto"
            onClick={() => onReset()}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
