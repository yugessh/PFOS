import { formatDate } from '@/lib/date';
import type { Transaction } from '@/src/types/transaction';

export interface TransactionFeedGroup {
  dateKey: string;
  date: Date;
  dayName: string;
  dayNumber: number;
  transactions: Transaction[];
  income: number;
  expense: number;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  food: '🍜',
  groceries: '🛒',
  restaurant: '🍽️',
  dining: '🍽️',
  cafe: '☕',
  canteen: '🍜',
  cake: '🎂',
  transport: '🛵',
  transportation: '🛵',
  fuel: '⛽',
  uber: '🚕',
  auto: '🚗',
  shopping: '🛍️',
  clothes: '👕',
  electronics: '📱',
  entertainment: '🎬',
  movies: '🎭',
  games: '🎮',
  bills: '📄',
  utilities: '💡',
  electricity: '⚡',
  water: '💧',
  internet: '📡',
  health: '🏥',
  healthcare: '🏥',
  salary: '💰',
  income: '💵',
  freelance: '💼',
  investments: '📈',
  gift: '🎁',
  bonus: '🏆',
  transfer: '↔️',
};

export function getTransactionCategoryIcon(category?: string): string {
  const key = `${category || ''}`.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || '💸';
}

export function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    const dateKey = formatDate(new Date(transaction.date));
    groups[dateKey] = groups[dateKey] || [];
    groups[dateKey].push(transaction);
  });

  return groups;
}

export function sortTransactionFeedDates(grouped: Record<string, Transaction[]>) {
  return Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));
}

export function buildTransactionFeedGroups(transactions: Transaction[]): TransactionFeedGroup[] {
  const grouped = groupTransactionsByDate(transactions);
  const sortedDates = sortTransactionFeedDates(grouped);

  return sortedDates.map((dateKey) => {
    const date = new Date(dateKey);
    const dayTransactions = [...(grouped[dateKey] || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const summary = dayTransactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') accumulator.income += transaction.amount;
        if (transaction.type === 'expense') accumulator.expense += Math.abs(transaction.amount);
        return accumulator;
      },
      { income: 0, expense: 0 }
    );

    return {
      dateKey,
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      transactions: dayTransactions,
      income: summary.income,
      expense: summary.expense,
    };
  });
}