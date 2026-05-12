'use client';

import type { Transaction } from '@/types';
import { ShoppingBag, Zap, DollarSign, Utensils, Fuel, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'food':
      return <Utensils size={18} />;
    case 'utilities':
      return <Zap size={18} />;
    case 'transportation':
      return <Fuel size={18} />;
    case 'shopping':
      return <ShoppingBag size={18} />;
    case 'entertainment':
      return <Tv size={18} />;
    case 'salary':
      return <DollarSign size={18} />;
    default:
      return <DollarSign size={18} />;
  }
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'food':
      return 'bg-orange-100 text-orange-600';
    case 'utilities':
      return 'bg-yellow-100 text-yellow-600';
    case 'transportation':
      return 'bg-blue-100 text-blue-600';
    case 'shopping':
      return 'bg-pink-100 text-pink-600';
    case 'entertainment':
      return 'bg-purple-100 text-purple-600';
    case 'salary':
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-muted transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className={cn('p-2 rounded-lg', getCategoryColor(transaction.category))}>
          {getCategoryIcon(transaction.category)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-card-foreground text-sm">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.category} • {transaction.date.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'font-bold text-sm',
            isIncome ? 'text-green-600' : 'text-card-foreground'
          )}
        >
          {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
