"use client";

import { useTransactionContext } from '@/src/context/TransactionContext';

export function useTransactions() {
  return useTransactionContext();
}
