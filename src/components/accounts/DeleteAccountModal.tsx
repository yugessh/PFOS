'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Account } from '@/src/services/firestore/accounts.service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onDelete: () => Promise<void> | void;
  deleting?: boolean;
}

export function DeleteAccountModal({ open, onOpenChange, account, onDelete, deleting = false }: Props) {
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  async function handleDelete() {
    try {
      setError(null);
      await onDelete();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
    }
  }

  const content = (
      <div className="space-y-4 text-sm text-muted-foreground">
      <div className="rounded-[24px] border border-[#FF6B6B]/20 bg-[#FF6B6B]/8 p-4 text-[#FFD0D0]">
        This will remove <span className="font-semibold text-white">{account?.name || 'this account'}</span> from your active money sources.
      </div>
      <p>
        The account will be archived with a soft delete. Historical transaction records remain untouched.
      </p>
        {error ? <p className="rounded-[20px] border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FFB1B1]">{error}</p> : null}
    </div>
  );

  if (!open) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="border-border/60 px-5 pb-6 pt-4 sm:max-w-none">
          <SheetHeader className="px-0 pt-2 text-left">
            <SheetTitle>Delete Account</SheetTitle>
            <SheetDescription>
              This action archives the account but keeps the existing ledger history.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 max-h-[60vh] overflow-y-auto pr-1">{content}</div>
          <SheetFooter className="px-0 pb-0 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto bg-[#FF5252] text-white hover:bg-[#f14b4b]" onClick={() => void handleDelete()} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/60 px-0 py-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action archives the account but keeps the existing ledger history.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{content}</div>
        <DialogFooter className="border-t border-border/60 px-6 py-5">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button className="bg-[#FF5252] text-white hover:bg-[#f14b4b]" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}