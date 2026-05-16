'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CreditCard,
  Target,
  TrendingUp,
  Zap,
  Bell,
  Wallet,
} from 'lucide-react';
import { useEffect } from 'react';

interface UniversalActionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onTransfer?: () => void;
  onAddAccount?: () => void;
  onAddGoal?: () => void;
  onAddInvestment?: () => void;
  onAddReminder?: () => void;
  onAddTrade?: () => void;
  onAddSubscription?: () => void;
}

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  shortcut?: string;
  category: 'transaction' | 'account' | 'planning' | 'reminders';
}

export function UniversalActionsSheet({
  open,
  onOpenChange,
  onAddExpense,
  onAddIncome,
  onTransfer,
  onAddAccount,
  onAddGoal,
  onAddInvestment,
  onAddReminder,
  onAddTrade,
  onAddSubscription,
}: UniversalActionsSheetProps) {
  const actions: Action[] = [
    {
      id: 'expense',
      label: 'Add Expense',
      icon: <ArrowUpRight className="size-5" />,
      color: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400',
      onClick: onAddExpense,
      shortcut: 'E',
      category: 'transaction',
    },
    {
      id: 'income',
      label: 'Add Income',
      icon: <ArrowDownLeft className="size-5" />,
      color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400',
      onClick: onAddIncome,
      shortcut: 'I',
      category: 'transaction',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: <ArrowLeftRight className="size-5" />,
      color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      onClick: onTransfer,
      shortcut: 'T',
      category: 'transaction',
    },
    {
      id: 'account',
      label: 'Add Account',
      icon: <CreditCard className="size-5" />,
      color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      onClick: onAddAccount,
      shortcut: 'A',
      category: 'account',
    },
    {
      id: 'goal',
      label: 'Add Goal',
      icon: <Target className="size-5" />,
      color: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      onClick: onAddGoal,
      shortcut: 'G',
      category: 'planning',
    },
    {
      id: 'investment',
      label: 'Add Investment',
      icon: <TrendingUp className="size-5" />,
      color: 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      onClick: onAddInvestment,
      shortcut: 'V',
      category: 'planning',
    },
    {
      id: 'trade',
      label: 'Add Trade',
      icon: <Zap className="size-5" />,
      color: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      onClick: onAddTrade,
      shortcut: 'D',
      category: 'planning',
    },
    {
      id: 'reminder',
      label: 'Add Reminder',
      icon: <Bell className="size-5" />,
      color: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      onClick: onAddReminder,
      shortcut: 'R',
      category: 'reminders',
    },
    {
      id: 'subscription',
      label: 'Add Subscription',
      icon: <Wallet className="size-5" />,
      color: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      onClick: onAddSubscription,
      shortcut: 'S',
      category: 'planning',
    },
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) return; // Avoid conflicts with Shift+key

      const action = actions.find(
        (a) => a.shortcut?.toUpperCase() === e.key.toUpperCase()
      );

      if (action && action.onClick) {
        e.preventDefault();
        action.onClick();
        onOpenChange(false);
      }

      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, actions]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center">Quick Actions</SheetTitle>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Use keyboard shortcuts to quick-add (press E, I, T, A, G, V, D, R, or S)
          </p>
        </SheetHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Transaction Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary px-1">
              Transactions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {actions
                .filter((a) => a.category === 'transaction')
                .map((action) => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    onClick={() => {
                      action.onClick?.();
                      onOpenChange(false);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary px-1">
              Accounts
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {actions
                .filter((a) => a.category === 'account')
                .map((action) => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    onClick={() => {
                      action.onClick?.();
                      onOpenChange(false);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Planning Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary px-1">
              Planning & Investing
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {actions
                .filter((a) => a.category === 'planning')
                .map((action) => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    onClick={() => {
                      action.onClick?.();
                      onOpenChange(false);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary px-1">
              Reminders
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {actions
                .filter((a) => a.category === 'reminders')
                .map((action) => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    onClick={() => {
                      action.onClick?.();
                      onOpenChange(false);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        <SheetClose asChild>
          <Button variant="outline" className="w-full mt-6 h-12 rounded-xl">
            Cancel
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}

interface ActionButtonProps {
  action: Action;
  onClick: () => void;
}

function ActionButton({ action, onClick }: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`w-full h-12 rounded-xl ${action.color} flex items-center gap-3 justify-between text-base font-medium`}
    >
      <div className="flex items-center gap-3">
        {action.icon}
        {action.label}
      </div>
      {action.shortcut && (
        <span className="text-xs px-2 py-1 rounded bg-black/10 font-mono">
          {action.shortcut}
        </span>
      )}
    </Button>
  );
}
