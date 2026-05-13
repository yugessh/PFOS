import type { Transaction } from '@/src/types/transaction';
import type { Account as UIAccount } from '@/src/components/transactions/types';

export function computeAccountBalances(accounts: UIAccount[], transactions: Transaction[]) {
  // Treat account.balance as starting balance
  const balances: Record<string, number> = {};
  accounts.forEach((a) => (balances[a.id] = a.balance || 0));

  transactions.forEach((t) => {
    if (!t.account) return;
    // Transfers are stored as type 'transfer' and may include toAccount
    // For backward compatibility: treat anything not 'transfer' as income/expense
    const type = (t as any).type;
    if (type === 'transfer') {
      // subtract from source
      balances[t.account] = (balances[t.account] ?? 0) - (t.amount || 0);
      const to = (t as any).toAccount;
      if (to) balances[to] = (balances[to] ?? 0) + (t.amount || 0);
    } else if (type === 'income') {
      balances[t.account] = (balances[t.account] ?? 0) + (t.amount || 0);
    } else {
      // expense
      balances[t.account] = (balances[t.account] ?? 0) - (t.amount || 0);
    }
  });

  return accounts.map((a) => ({ ...a, balance: balances[a.id] ?? a.balance }));
}

export function getMonthlyTotals(transactions: Transaction[], year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = (month ?? now.getMonth() + 1) - 1; // zero-based

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  let income = 0;
  let expenses = 0;

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d >= start && d <= end) {
      const type = (t as any).type;
      if (type === 'income') income += t.amount || 0;
      else if (type === 'expense') expenses += t.amount || 0;
      // transfers ignored for monthly totals
    }
  });

  return { income, expenses };
}

export function computeTotals(transactions: Transaction[]) {
  let income = 0;
  let expenses = 0;
  transactions.forEach((t) => {
    const type = (t as any).type;
    if (type === 'income') income += t.amount || 0;
    else if (type === 'expense') expenses += t.amount || 0;
  });
  return { income, expenses, savings: income - expenses };
}

export function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    const key = new Date(t.date).toISOString().split('T')[0];
    groups[key] = groups[key] || [];
    groups[key].push(t);
  });
  return groups;
}
