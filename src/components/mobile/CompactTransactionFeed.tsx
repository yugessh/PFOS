'use client';

import { format } from 'date-fns';
import { formatCurrency } from '@/src/lib/currency';
import type { Transaction } from '@/src/types/transaction';

interface CompactTransactionFeedProps {
  transactions: Transaction[];
  grouped: Record<string, Transaction[]>;
  sortedDates: string[];
  onTransactionClick?: (tx: Transaction) => void;
  onGroupClick?: (date: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  food: '🍜',
  groceries: '🛒',
  transportation: '🛵',
  transport: '🛵',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '💡',
  utilities: '💡',
  health: '🏥',
  healthcare: '🏥',
  salary: '💰',
  bonus: '🎁',
  freelance: '💼',
  investments: '📈',
  transfer: '↔️',
  dining: '🍽️',
};

function getCategoryIcon(category: string): string {
  const key = `${category || ''}`.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || '📦';
}

function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return 'Today';
  }
  if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    return 'Yesterday';
  }

  return format(date, 'EEE, MMM d');
}

export function CompactTransactionFeed({
  transactions,
  grouped,
  sortedDates,
  onTransactionClick,
  onGroupClick,
}: CompactTransactionFeedProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {sortedDates.map((dateKey) => {
        const dayTransactions = grouped[dateKey] || [];
        const dayIncome = dayTransactions.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const dayExpenses = dayTransactions.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

        return (
          <div key={dateKey} className="py-2">
            {/* Date Header with Summary */}
            <div
              className="flex items-center justify-between px-4 py-1.5 text-xs cursor-pointer hover:bg-muted/50 rounded transition-colors"
              onClick={() => onGroupClick?.(dateKey)}
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{getDayLabel(dateKey)}</p>
              </div>
              <div className="flex gap-4 text-xs">
                {dayIncome > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    +{formatCurrency(dayIncome)}
                  </span>
                )}
                {dayExpenses > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    -{formatCurrency(dayExpenses)}
                  </span>
                )}
              </div>
            </div>

            {/* Transactions */}
            <div className="space-y-0">
              {dayTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-primary"
                  onClick={() => onTransactionClick?.(tx)}
                >
                  {/* Icon & Description */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{getCategoryIcon(tx.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground truncate">{tx.account || 'Account'}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
