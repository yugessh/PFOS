"use client";

import { useAccountContext } from '@/src/context/AccountContext';

export function useAccounts() {
  return useAccountContext();
}
