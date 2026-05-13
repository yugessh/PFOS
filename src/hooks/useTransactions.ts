"use client";

import { useTransactionContext } from '@/context/TransactionContext';

export function useTransactions() {
  return useTransactionContext();
}
