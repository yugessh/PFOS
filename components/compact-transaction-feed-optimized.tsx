'use client';

import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/src/lib/currency';
import type { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, memo, useMemo, useCallback } from 'react';

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
    'food': '🍜',
    'groceries': '🛒',
    'restaurant': '🍽️',
    'cafe': '☕',
    'canteen': '🍜',
    'cake': '🎂',
    'transport': '🚗',
    'fuel': '⛽',
    'uber': '🚕',
    'auto': '🚗',
    'shopping': '🛍️',
    'clothes': '👕',
    'electronics': '📱',
    'entertainment': '🎬',
    'movies': '🎭',
    'games': '🎮',
    'bills': '📄',
    'electricity': '⚡',
    'water': '💧',
    'internet': '📡',
    'salary': '💰',
    'income': '💵',
    'gift': '🎁',
    'bonus': '🏆',
  };
  
  const key = category?.toLowerCase() || 'other';
  return emojis[key] || '💸';
}

// Memoize transaction item to prevent re-renders
interface TransactionItemProps {
  transaction: Transaction;
  onTransactionClick?: (transaction: Transaction) => void;
}

const TransactionItem = memo(function TransactionItem({ transaction, onTransactionClick }: TransactionItemProps) {
  const handleClick = useCallback(() => {
    onTransactionClick?.(transaction);
  }, [transaction, onTransactionClick]);

  return (
    <div
      className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors rounded-lg"
      onClick={handleClick}
    >
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
  );
});

interface DateGroupProps {
  dateKey: string;
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

const DateGroup = memo(function DateGroup({ dateKey, transactions, onTransactionClick }: DateGroupProps) {
  const date = new Date(dateKey);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();

  const { income, expense } = useMemo(() => {
    return {
      income: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expense: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    };
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="space-y-2">
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

      <div className="space-y-0.5">
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onTransactionClick={onTransactionClick}
          />
        ))}
      </div>
    </div>
  );
});

export const CompactTransactionFeed = memo(function CompactTransactionFeed({
  transactions,
  onTransactionClick,
}: CompactTransactionFeedProps) {
  // Group transactions by date using useMemo to prevent recalculation
  const groupedByDate = useMemo(() => {
    return transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
      const dateKey = new Date(tx.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {});
  }, [transactions]);

  // Sort dates using useMemo
  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedByDate]);

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey) => (
        <DateGroup
          key={dateKey}
          dateKey={dateKey}
          transactions={groupedByDate[dateKey]}
          onTransactionClick={onTransactionClick}
        />
      ))}
    </div>
  );
});
