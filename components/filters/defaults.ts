import type { FinanceFilters } from './types';

/** Sentinel value for “All” in Radix Select (empty string is avoided). */
export const FINANCE_FILTER_ALL = '__all__';

export function createDefaultFinanceFilters(): FinanceFilters {
  return {
    search: '',
    dateFrom: '',
    dateTo: '',
    category: FINANCE_FILTER_ALL,
    account: FINANCE_FILTER_ALL,
    transactionType: 'all',
    amountMin: '',
    amountMax: '',
  };
}
