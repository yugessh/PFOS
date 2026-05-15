'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpRight, ArrowDownLeft, SwapHorizontal2 } from 'lucide-react';

interface AddActionsBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onTransfer?: () => void;
  onAddAccount?: () => void;
}

export function AddActionsBottomSheet({
  open,
  onOpenChange,
  onAddExpense,
  onAddIncome,
  onTransfer,
  onAddAccount,
}: AddActionsBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center">Add Transaction</SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          {/* Add Expense */}
          <Button
            onClick={() => {
              onAddExpense?.();
              onOpenChange(false);
            }}
            className="w-full h-12 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3 justify-start text-base font-medium"
          >
            <ArrowUpRight className="size-5" />
            Add Expense
          </Button>

          {/* Add Income */}
          <Button
            onClick={() => {
              onAddIncome?.();
              onOpenChange(false);
            }}
            className="w-full h-12 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-3 justify-start text-base font-medium"
          >
            <ArrowDownLeft className="size-5" />
            Add Income
          </Button>

          {/* Transfer */}
          <Button
            onClick={() => {
              onTransfer?.();
              onOpenChange(false);
            }}
            className="w-full h-12 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center gap-3 justify-start text-base font-medium"
          >
            <SwapHorizontal2 className="size-5" />
            Transfer
          </Button>

          {/* Add Account */}
          <Button
            onClick={() => {
              onAddAccount?.();
              onOpenChange(false);
            }}
            className="w-full h-12 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center gap-3 justify-start text-base font-medium"
          >
            <Plus className="size-5" />
            Add Account
          </Button>
        </div>

        <SheetClose asChild>
          <Button
            variant="outline"
            className="w-full mt-4 h-12 rounded-xl"
          >
            Cancel
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
