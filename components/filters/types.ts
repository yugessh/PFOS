export type TransactionTypeFilter = 'all' | 'income' | 'expense';

/** Controlled filter model — UI only; wire to data sources later. */
export interface FinanceFilters {
  search: string;
  /** `YYYY-MM-DD` or empty */
  dateFrom: string;
  /** `YYYY-MM-DD` or empty */
  dateTo: string;
  /** Use `FINANCE_FILTER_ALL` for “any”. */
  category: string;
  /** Use `FINANCE_FILTER_ALL` for “any”. */
  account: string;
  transactionType: TransactionTypeFilter;
  /** Plain text for controlled inputs; empty = no bound */
  amountMin: string;
  amountMax: string;
}

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  filters: FinanceFilters;
  onChange: (next: FinanceFilters) => void;
  onReset: () => void;
  categoryOptions: FilterSelectOption[];
  accountOptions: FilterSelectOption[];
  className?: string;
}
