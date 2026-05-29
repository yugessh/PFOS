'use client';

import { memo, useCallback, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { buildTransactionFeedGroups, getTransactionCategoryIcon } from '@/src/lib/transaction-feed';
import type { Transaction } from '@/src/types/transaction';

export interface UnifiedTransactionFeedProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onGroupClick?: (dateKey: string) => void;
  grouped?: Record<string, Transaction[]>;
  sortedDates?: string[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loadingRows?: number;
  className?: string;
}

function formatFeedAmount(amount: number) {
  return Math.abs(amount).toLocaleString('en-IN');
}

interface TransactionRowProps {
  transaction: Transaction;
  onTransactionClick?: (transaction: Transaction) => void;
}

const TransactionRow = memo(function TransactionRow({ transaction, onTransactionClick }: TransactionRowProps) {
  const handleClick = useCallback(() => {
    onTransactionClick?.(transaction);
  }, [transaction, onTransactionClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        'sm:px-4 sm:py-3'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/70 text-base sm:size-10 sm:text-lg">
          {getTransactionCategoryIcon(transaction.category)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{transaction.description}</p>
          <p className="truncate text-xs text-muted-foreground">{transaction.account || 'Account'}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            'text-sm font-semibold sm:text-[15px]',
            transaction.type === 'income' ? 'text-emerald-500' : 'text-foreground'
          )}
        >
          {transaction.type === 'income' ? '+' : '-'}₹{formatFeedAmount(transaction.amount)}
        </p>
      </div>
    </button>
  );
});

interface TransactionGroupProps {
  dateKey: string;
  transactions: Transaction[];
  income: number;
  expense: number;
  onTransactionClick?: (transaction: Transaction) => void;
  onGroupClick?: (dateKey: string) => void;
}

const TransactionGroup = memo(function TransactionGroup({
  dateKey,
  transactions,
  income,
  expense,
  onTransactionClick,
  onGroupClick,
}: TransactionGroupProps) {
  const date = new Date(dateKey);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();

  const handleGroupClick = useCallback(() => {
    onGroupClick?.(dateKey);
  }, [dateKey, onGroupClick]);

  const headerClassName = cn(
    'flex items-center justify-between gap-3 px-3 text-xs sm:px-4',
    onGroupClick ? 'cursor-pointer rounded-xl py-1.5 transition-colors hover:bg-muted/40' : 'py-0'
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">
          {dayNumber} {dayName}
        </span>
      </div>
      <div className="flex gap-4 text-[11px]">
        {income > 0 ? <span className="font-medium text-emerald-500">+₹{formatFeedAmount(income)}</span> : null}
        {expense > 0 ? <span className="font-medium text-rose-500">-₹{formatFeedAmount(expense)}</span> : null}
      </div>
    </>
  );

  return (
    <div className="space-y-2">
      {onGroupClick ? (
        <button type="button" className={headerClassName} onClick={handleGroupClick}>
          {headerContent}
        </button>
      ) : (
        <div className={headerClassName}>{headerContent}</div>
      )}

      <div className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onTransactionClick={onTransactionClick}
          />
        ))}
      </div>
    </div>
  );
});

export function UnifiedTransactionFeed({
  transactions,
  onTransactionClick,
  onGroupClick,
  grouped,
  sortedDates,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'No transactions yet',
  emptyDescription = 'Your spending and income will appear here when you add your first entry.',
  emptyAction,
  loadingRows = 5,
  className,
}: UnifiedTransactionFeedProps) {
  const normalizedGroups = useMemo(() => {
    if (grouped && sortedDates) {
      return sortedDates.map((dateKey) => {
        const date = new Date(dateKey);
        const dayTransactions = [...(grouped[dateKey] || [])].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const summary = dayTransactions.reduce(
          (accumulator, transaction) => {
            if (transaction.type === 'income') accumulator.income += transaction.amount;
            if (transaction.type === 'expense') accumulator.expense += Math.abs(transaction.amount);
            return accumulator;
          },
          { income: 0, expense: 0 }
        );

        return {
          dateKey,
          date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          transactions: dayTransactions,
          income: summary.income,
          expense: summary.expense,
        };
      });
    }

    return buildTransactionFeedGroups(transactions);
  }, [grouped, sortedDates, transactions]);

  if (loading) {
    return <LoadingState type="table" rows={loadingRows} className={className} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load transactions"
        description={error}
        retryAction={
          onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-accent-mint px-5 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_14px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95"
            >
              Retry
            </button>
          ) : undefined
        }
        className={className}
      />
    );
  }

  if (normalizedGroups.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {normalizedGroups.map((group) => (
        <TransactionGroup
          key={group.dateKey}
          dateKey={group.dateKey}
          transactions={group.transactions}
          income={group.income}
          expense={group.expense}
          onTransactionClick={onTransactionClick}
          onGroupClick={onGroupClick}
        />
      ))}
    </div>
  );
}