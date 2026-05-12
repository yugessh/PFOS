'use client';

import { formatDate } from '@/lib/date';
import { Transaction } from '@/lib/types';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function RecentTransactionsTable({ transactions, limit = 5 }: RecentTransactionsTableProps) {
  const recent = transactions.slice(0, limit);

  return (
    <div className="space-y-2">
      {recent.length > 0 ? (
        recent.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${
                transaction.type === 'income'
                  ? 'bg-green-600/10'
                  : 'bg-red-600/10'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft size={16} className="text-green-600" />
                ) : (
                  <ArrowUpRight size={16} className="text-red-600" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className={`font-bold text-sm ${
                transaction.type === 'income'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No transactions yet</p>
        </div>
      )}
    </div>
  );
}
