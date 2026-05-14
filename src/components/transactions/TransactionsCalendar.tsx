'use client';

import { formatDate } from '@/lib/date';
import { getMonthLabel } from '@/src/lib/finance';
import type { Transaction } from '@/src/types/transaction';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionsCalendarProps {
  currentMonth: Date;
  transactions: Transaction[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TransactionsCalendar({
  currentMonth,
  transactions,
  selectedDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}: TransactionsCalendarProps) {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const firstWeekday = monthStart.getDay();
  const totalDays = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const dailyTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;
    const key = formatDate(new Date(tx.date));
    dailyTotals[key] = (dailyTotals[key] || 0) + tx.amount;
  });

  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const cells = Array.from({ length: totalDays }, (_, index) => {
    const dayOffset = index - firstWeekday;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1 + dayOffset);
    const key = formatDate(date);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const amount = dailyTotals[key] || 0;
    const label = date.getDate();
    const selected = key === selectedDate;

    return {
      key,
      date,
      label,
      amount,
      isCurrentMonth,
      selected,
      indicator: Math.min(1, amount / maxDaily),
    };
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Calendar view</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{getMonthLabel(currentMonth)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={onPreviousMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={onNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <button
            key={cell.key}
            type="button"
            onClick={() => onSelectDate(cell.key)}
            disabled={!cell.isCurrentMonth}
            className={`group rounded-3xl border p-3 text-left transition ${
              cell.selected
                ? 'border-blue-600 bg-blue-600/10 text-blue-900 dark:text-blue-100'
                : 'border-transparent bg-gray-50 hover:border-gray-200 dark:bg-gray-900 dark:hover:border-gray-700'
            } ${cell.isCurrentMonth ? '' : 'opacity-40'} `}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{cell.label}</span>
              {cell.amount > 0 ? (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">{cell.amount ? '₹' + cell.amount.toFixed(0) : ''}</span>
              ) : null}
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.max(4, cell.indicator * 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
