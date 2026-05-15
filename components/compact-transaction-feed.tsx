'use client';

import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/src/lib/currency';
import type { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionGroup {
  date: Date;
  dayName: string;
  income: number;
  expense: number;
  transactions: Transaction[];
}

interface CompactTransactionFeedProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

function getCategoryEmoji(category?: string): string {
  const emojis: Record<string, string> = {
    // Food
    'food': '🍜',
    'groceries': '🛒',
    'restaurant': '🍽️',
    'cafe': '☕',
    'canteen': '🍜',
    'cake': '🎂',
    // Transport
    'transport': '🚗',
    'fuel': '⛽',
    'uber': '🚕',
    'auto': '🚗',
    // Shopping
    'shopping': '🛍️',
    'clothes': '👕',
    'electronics': '📱',
    // Entertainment
    'entertainment': '🎬',
    'movies': '🎭',
    'games': '🎮',
    // Bills
    'bills': '📄',
    'electricity': '⚡',
    'water': '💧',
    'internet': '📡',
    // Other
    'salary': '💰',
    'income': '💵',
    'gift': '🎁',
    'bonus': '🏆',
  };
  
  const key = category?.toLowerCase() || 'other';
  return emojis[key] || '💸';
}

export function CompactTransactionFeed({
  transactions,
  onTransactionClick,
}: CompactTransactionFeedProps) {
  // Group transactions by date
  const groupedByDate = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const dateKey = new Date(tx.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(tx);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey) => {
        const date = new Date(dateKey);
        const dateTransactions = groupedByDate[dateKey];
        
        const income = dateTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = dateTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();

        return (
          <div key={dateKey} className="space-y-2">
            {/* Date Header */}
            <div className="px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dayNum} {dayName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                {income > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    +₹{income.toLocaleString('en-IN')}
                  </span>
                )}
                {expense > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    -₹{expense.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Transactions for this date */}
            <div className="space-y-0.5">
              {dateTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors rounded-lg"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    {/* Left side: Icon + Description */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-lg flex-shrink-0">
                        {getCategoryEmoji(transaction.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.account || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Amount */}
                    <div className="ml-2 text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
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
