export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: Date;
  account: string;
}

export type TransactionStatus = 'posted' | 'pending' | 'failed' | 'cleared';

/** Row shape for `TransactionsTable` and ledger-style UIs. */
export interface TransactionTableRow {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  account: string;
  status: TransactionStatus;
  date: Date;
}
