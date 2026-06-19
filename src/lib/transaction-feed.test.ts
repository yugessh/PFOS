import { describe, it, expect } from 'vitest';
import {
  getTransactionCategoryIcon,
  groupTransactionsByDate,
  sortTransactionFeedDates,
  buildTransactionFeedGroups,
} from '@/src/lib/transaction-feed';
import type { Transaction } from '@/src/types/transaction';

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    description: 'test',
    amount: 100,
    type: 'income',
    category: 'salary',
    date: new Date('2024-01-01T10:00:00Z'),
    account: 'a1',
    ...overrides,
  } as Transaction;
}

describe('getTransactionCategoryIcon', () => {
  it('returns icon for known category (case‑insensitive, trimmed)', () => {
    expect(getTransactionCategoryIcon('  Food')).toBe('🍜');
    expect(getTransactionCategoryIcon('GroCeRieS')).toBe('🛒');
  });

  it('falls back to default for unknown category', () => {
    expect(getTransactionCategoryIcon('unknownCat')).toBe('💸');
    expect(getTransactionCategoryIcon(undefined)).toBe('💸');
  });
});

describe('groupTransactionsByDate', () => {
  it('groups transactions by UTC date string', () => {
    const t1 = makeTransaction({ date: new Date('2024-02-15T01:00:00Z') }); // 2024-02-15
    const t2 = makeTransaction({ id: 't2', date: new Date('2024-02-15T23:59:59Z') }); // same day
    const t3 = makeTransaction({ id: 't3', date: new Date('2024-02-16T05:00:00Z') }); // next day
    const groups = groupTransactionsByDate([t1, t2, t3]);
    expect(Object.keys(groups)).toEqual(['2024-02-15', '2024-02-16']);
    expect(groups['2024-02-15']).toHaveLength(2);
    expect(groups['2024-02-16']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupTransactionsByDate([])).toEqual({});
  });
});

describe('sortTransactionFeedDates', () => {
  it('sorts keys descending (newest first)', () => {
    const unsorted = { '2023-01-01': [], '2024-05-10': [], '2022-12-31': [] };
    const sorted = sortTransactionFeedDates(unsorted);
    expect(sorted).toEqual(['2024-05-10', '2023-01-01', '2022-12-31']);
  });
});

describe('buildTransactionFeedGroups', () => {
  it('creates groups with correct summaries and ordering', () => {
    const incomeTx = makeTransaction({ amount: 500, type: 'income', date: new Date('2024-03-02T08:00:00Z') });
    const expenseTx = makeTransaction({ id: 't2', amount: -200, type: 'expense', date: new Date('2024-03-02T12:00:00Z') });
    const laterTx = makeTransaction({ id: 't3', amount: 300, type: 'income', date: new Date('2024-03-05T09:30:00Z') });
    const groups = buildTransactionFeedGroups([incomeTx, expenseTx, laterTx]);
    // Expect two groups, most recent date first
    expect(groups).toHaveLength(2);
    expect(groups[0].dateKey).toBe('2024-03-05');
    expect(groups[0].income).toBe(300);
    expect(groups[0].expense).toBe(0);
    expect(groups[1].dateKey).toBe('2024-03-02');
    expect(groups[1].income).toBe(500);
    // expense should be absolute value
    expect(groups[1].expense).toBe(200);
    // dayName and dayNumber sanity checks (locale independent for dayName)
    expect(groups[1].dayNumber).toBe(2);
    expect(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']).toContain(groups[1].dayName);
  });

  it('handles empty input gracefully', () => {
    expect(buildTransactionFeedGroups([])).toEqual([]);
  });
});
