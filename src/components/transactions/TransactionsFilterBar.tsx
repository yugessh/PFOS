'use client';

import { ChevronLeft, ChevronRight, CalendarDays, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionsFilterBarProps {
  monthLabel: string;
  viewMode: 'timeline' | 'calendar';
  timeFilter: 'daily' | 'weekly' | 'monthly';
  categoryFilter: string;
  accountFilter: string;
  categories: string[];
  accounts: { id: string; name: string }[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onViewModeChange: (mode: 'timeline' | 'calendar') => void;
  onTimeFilterChange: (value: 'daily' | 'weekly' | 'monthly') => void;
  onCategoryChange: (value: string) => void;
  onAccountChange: (value: string) => void;
}

export function TransactionsFilterBar({
  monthLabel,
  viewMode,
  timeFilter,
  categoryFilter,
  accountFilter,
  categories,
  accounts,
  onPreviousMonth,
  onNextMonth,
  onViewModeChange,
  onTimeFilterChange,
  onCategoryChange,
  onAccountChange,
}: TransactionsFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={onPreviousMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Selected month</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{monthLabel}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={onNextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">View</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { value: 'timeline', label: 'Timeline', icon: List },
              { value: 'calendar', label: 'Calendar', icon: CalendarDays },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onViewModeChange(mode.value as 'timeline' | 'calendar')}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                    viewMode === mode.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Icon className="size-3" />
                    {mode.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">Range</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['daily', 'weekly', 'monthly'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onTimeFilterChange(option as 'daily' | 'weekly' | 'monthly')}
                className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                  timeFilter === option
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">Filters</p>
          <div className="space-y-2">
            <select
              value={categoryFilter}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={accountFilter}
              onChange={(event) => onAccountChange(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="all">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
