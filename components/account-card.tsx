'use client';

import { Account } from '@/lib/types';
import { CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

function getAccountIcon(type: string) {
  switch (type) {
    case 'savings':
      return <Wallet className="w-5 h-5" />;
    case 'checking':
      return <CreditCard className="w-5 h-5" />;
    case 'investment':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <Wallet className="w-5 h-5" />;
  }
}

function getAccountColor(type: string) {
  switch (type) {
    case 'savings':
      return 'from-blue-500 to-blue-600';
    case 'checking':
      return 'from-purple-500 to-purple-600';
    case 'investment':
      return 'from-emerald-500 to-emerald-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-gradient-to-br',
        getAccountColor(account.type),
        'rounded-lg p-6 text-white cursor-pointer transition-transform hover:scale-105 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-sm text-white/80 mb-1">{account.name}</p>
          <h3 className="text-2xl font-bold">₹{(account.balance / 1000).toFixed(1)}K</h3>
        </div>
        <div className="p-2 bg-white/20 rounded-lg">
          {getAccountIcon(account.type)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/70">Account Type</p>
          <p className="text-sm font-medium capitalize">{account.type}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70">Last Updated</p>
          <p className="text-sm font-medium">Today</p>
        </div>
      </div>
    </div>
  );
}
