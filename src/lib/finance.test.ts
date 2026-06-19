import { describe, it, expect } from 'vitest';
import {
  computeAccountBalances,
  getMonthlyTotals,
  computeTotals,
  getMonthRange,
  getWeekRange,
  getDayRange,
  getMonthLabel,
} from './finance';

// Minimal type stubs matching the real interfaces
interface MockAccount {
  id: string;
  balance?: number;
}
interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: Date;
  account?: string; // optional to test missing account handling
  toAccount?: string; // for transfers
}

describe('computeAccountBalances', () => {
  it('returns empty array when no accounts', () => {
    const res = computeAccountBalances([], []);
    expect(res).toEqual([]);
  });

  it('keeps initial balances when no transactions', () => {
    const accounts: MockAccount[] = [{ id: 'a1', balance: 100 }, { id: 'a2', balance: 200 }];
    const res = computeAccountBalances(accounts as any, []);
    expect(res).toEqual([
      { id: 'a1', balance: 100 },
      { id: 'a2', balance: 200 },
    ]);
  });

  it('applies income and expense transactions', () => {
    const accounts: MockAccount[] = [{ id: 'a1', balance: 0 }];
    const txs: MockTransaction[] = [
      { id: 't1', description: 'salary', amount: 5000, type: 'income', category: 'salary', date: new Date(), account: 'a1' },
      { id: 't2', description: 'groceries', amount: 1500, type: 'expense', category: 'food', date: new Date(), account: 'a1' },
    ];
    const res = computeAccountBalances(accounts as any, txs as any);
    expect(res[0].balance).toBe(3500);
  });

  it('handles transfer between accounts', () => {
    const accounts: MockAccount[] = [
      { id: 'a1', balance: 1000 },
      { id: 'a2', balance: 500 },
    ];
    const txs: MockTransaction[] = [
      { id: 't1', description: 'move', amount: 300, type: 'transfer', category: 'transfer', date: new Date(), account: 'a1', toAccount: 'a2' },
    ];
    const res = computeAccountBalances(accounts as any, txs as any);
    const a1 = res.find((a) => a.id === 'a1');
    const a2 = res.find((a) => a.id === 'a2');
    expect(a1?.balance).toBe(700);
    expect(a2?.balance).toBe(800);
  });

  it('ignores transaction without account', () => {
    const accounts: MockAccount[] = [{ id: 'a1', balance: 0 }];
    const txs: MockTransaction[] = [
      { id: 't1', description: 'orphan', amount: 100, type: 'income', category: 'misc', date: new Date() },
    ];
    const res = computeAccountBalances(accounts as any, txs as any);
    expect(res[0].balance).toBe(0);
  });
});

describe('getMonthlyTotals', () => {
  const baseDate = new Date('2024-04-15');
  it('returns zeros when no transactions', () => {
    const res = getMonthlyTotals([], 2024, 4);
    expect(res).toEqual({ income: 0, expenses: 0 });
  });

  it('includes income on first day of month', () => {
    const tx: MockTransaction = {
      id: 't1', description: 'first', amount: 1000, type: 'income', category: 'salary', date: new Date('2024-04-01'), account: 'a1',
    } as any;
    const res = getMonthlyTotals([tx] as any, 2024, 4);
    expect(res.income).toBe(1000);
    expect(res.expenses).toBe(0);
  });

  it('includes expense on last day of month', () => {
    const tx: MockTransaction = {
      id: 't2', description: 'last', amount: 500, type: 'expense', category: 'food', date: new Date('2024-04-30'), account: 'a1',
    } as any;
    const res = getMonthlyTotals([tx] as any, 2024, 4);
    expect(res.expenses).toBe(500);
  });

  it('ignores transfers', () => {
    const tx: MockTransaction = {
      id: 't3', description: 'transfer', amount: 200, type: 'transfer', category: 'transfer', date: new Date('2024-04-15'), account: 'a1',
    } as any;
    const res = getMonthlyTotals([tx] as any, 2024, 4);
    expect(res).toEqual({ income: 0, expenses: 0 });
  });
});

describe('computeTotals', () => {
  it('calculates totals correctly', () => {
    const txs: MockTransaction[] = [
      { id: 'i1', description: 'sal', amount: 3000, type: 'income', category: 'salary', date: new Date(), account: 'a1' },
      { id: 'e1', description: 'bill', amount: 800, type: 'expense', category: 'bills', date: new Date(), account: 'a1' },
    ];
    const res = computeTotals(txs as any);
    expect(res).toEqual({ income: 3000, expenses: 800, savings: 2200 });
  });

  it('handles empty list', () => {
    expect(computeTotals([])).toEqual({ income: 0, expenses: 0, savings: 0 });
  });
});

describe('date range helpers', () => {
  it('getMonthRange returns correct start/end for Jan', () => {
    const { start, end } = getMonthRange(2024, 1);
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(0); // January is month 0
    expect(start.getDate()).toBe(1);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });

  it('handles February in leap year', () => {
    const { start, end } = getMonthRange(2024, 2);
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(1); // February
    expect(start.getDate()).toBe(1);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getMonth()).toBe(1);
    expect(end.getDate()).toBe(29);
  });

  it('getWeekRange starts on Sunday', () => {
    const { start, end } = getWeekRange(new Date('2024-04-10')); // Wednesday
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(3); // April month index 3
    expect(start.getDate()).toBe(7);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getMonth()).toBe(3);
    expect(end.getDate()).toBe(13);
  });

  it('getDayRange covers full day', () => {
    const { start, end } = getDayRange(new Date('2024-04-15T12:34:56Z'));
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(3);
    expect(start.getDate()).toBe(15);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getMonth()).toBe(3);
    expect(end.getDate()).toBe(15);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    // milliseconds are not directly comparable, but should be 999
    expect(end.getMilliseconds()).toBe(999);
  });

  it('getMonthLabel contains month name and year', () => {
    const label = getMonthLabel(new Date('2024-01-15'));
    expect(label).toMatch(/January\s+2024/);
  });
});
