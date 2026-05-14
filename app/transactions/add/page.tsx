'use client';

import { useRouter } from 'next/navigation';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import type { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';

export default function AddTransactionPage() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  return (
    <AddTransactionModal
      open={true}
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
      onSave={async (tx: TransactionFormData) => {
        await addTransaction(tx);
        router.push('/dashboard/transactions');
      }}
    />
  );
}
