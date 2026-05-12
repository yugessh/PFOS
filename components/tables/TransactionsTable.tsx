'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date';
import {
  formatSignedTransactionAmount,
  formatTransactionStatusLabel,
} from '@/lib/format-transaction';
import type { TransactionStatus, TransactionTableRow } from '@/types';
import { cn } from '@/lib/utils';

const statusBadgeClass: Record<TransactionStatus, string> = {
  posted:
    'border-emerald-500/25 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-300',
  cleared: 'border-sky-500/25 bg-sky-500/10 font-medium text-sky-900 dark:text-sky-300',
  pending:
    'border-amber-500/25 bg-amber-500/10 font-medium text-amber-900 dark:text-amber-200',
  failed:
    'border-destructive/35 bg-destructive/10 font-medium text-destructive dark:text-red-400',
};

export interface TransactionsTableProps {
  transactions: TransactionTableRow[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TransactionTableRow) => void;
  limit?: number;
  className?: string;
}

const SKELETON_ROWS = 6;

export function TransactionsTable({
  transactions,
  loading = false,
  emptyMessage = 'No transactions to show',
  onRowClick,
  limit,
  className,
}: TransactionsTableProps) {
  const rows =
    limit !== undefined ? transactions.slice(0, Math.max(0, limit)) : transactions;

  if (loading) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-card dark:border-border/80',
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-3 text-xs font-medium">Title</TableHead>
              <TableHead className="h-9 px-3 text-xs font-medium">Category</TableHead>
              <TableHead className="h-9 px-3 text-xs font-medium">Account</TableHead>
              <TableHead className="h-9 px-3 text-xs font-medium">Status</TableHead>
              <TableHead className="h-9 px-3 text-right text-xs font-medium">Date</TableHead>
              <TableHead className="h-9 px-3 text-right text-xs font-medium">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-4 w-[min(100%,12rem)]" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="ml-auto h-4 w-24" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-border bg-muted/20 px-4 py-12 text-center dark:border-border/80',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card dark:border-border/80',
        className
      )}
    >
      <Table className="min-w-[44rem] text-xs sm:text-sm">
        <TableHeader>
          <TableRow className="border-border/80 hover:bg-muted/30 dark:border-border/60 dark:hover:bg-muted/20">
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Title</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Category</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Account</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">Date</TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const clickable = onRowClick != null;
            return (
              <TableRow
                key={row.id}
                className={cn(
                  'border-border/60 dark:border-border/50',
                  clickable && 'cursor-pointer hover:bg-muted/60 dark:hover:bg-muted/40'
                )}
                onClick={clickable ? () => onRowClick(row) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
              >
                <TableCell className="max-w-[14rem] px-3 py-2.5 font-medium text-foreground">
                  <span className="line-clamp-2">{row.title}</span>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-muted-foreground">{row.category}</TableCell>
                <TableCell className="px-3 py-2.5 text-muted-foreground">{row.account}</TableCell>
                <TableCell className="px-3 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn('text-[0.65rem] uppercase tracking-wide', statusBadgeClass[row.status])}
                  >
                    {formatTransactionStatusLabel(row.status)}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatDate(row.date)}
                </TableCell>
                <TableCell
                  className={cn(
                    'px-3 py-2.5 text-right text-sm font-semibold tabular-nums',
                    row.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {formatSignedTransactionAmount(row.amount, row.type)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
