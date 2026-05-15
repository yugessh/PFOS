'use client';

import { Plus, TrendingDown, TrendingUp, ArrowRightLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FABMenuOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface CompactFABProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onTransfer: () => void;
  onManageAccounts: () => void;
}

export function CompactFAB({ onAddExpense, onAddIncome, onTransfer, onManageAccounts }: CompactFABProps) {
  const [open, setOpen] = useState(false);

  const options: FABMenuOption[] = [
    {
      label: 'Expense',
      icon: <TrendingDown size={20} />,
      onClick: onAddExpense,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Income',
      icon: <TrendingUp size={20} />,
      onClick: onAddIncome,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Transfer',
      icon: <ArrowRightLeft size={20} />,
      onClick: onTransfer,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Accounts',
      icon: <CreditCard size={20} />,
      onClick: onManageAccounts,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu Items */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 lg:hidden">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3 animate-in fade-in zoom-in-95">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-background px-2 py-1 rounded-full border">
                {option.label}
              </span>
              <button
                onClick={() => {
                  option.onClick();
                  setOpen(false);
                }}
                className={`${option.color} text-white p-3 rounded-full shadow-lg transition-all hover:shadow-xl flex-shrink-0`}
              >
                {option.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-20 right-4 z-50 lg:hidden w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center ${
          open ? 'rotate-45' : ''
        }`}
      >
        <Plus size={24} />
      </button>
    </>
  );
}
