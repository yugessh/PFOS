import type { Transaction } from '@/src/types/transaction';

export interface BudgetModel {
  id: string;
  userId: string;
  monthKey: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  monthlyLimit: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface BudgetWithProgress extends BudgetModel {
  spent: number;
  remaining: number;
  progressPercent: number;
  isNearLimit: boolean;
  isOverBudget: boolean;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  nearLimitCount: number;
}

const DEFAULT_CATEGORY_OPTIONS = [
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'transport', name: 'Transport', icon: '🛵' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'bills', name: 'Bills', icon: '💡' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
] as const;

export const DEFAULT_BUDGET_CATEGORY_OPTIONS = DEFAULT_CATEGORY_OPTIONS;

export function getMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

export function normalizeCategoryKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function isInMonth(date: Date, monthKey: string): boolean {
  return getMonthKey(date) === monthKey;
}

export function getBudgetSpentAmount(
  budget: Pick<BudgetModel, 'categoryId' | 'categoryName' | 'monthKey'>,
  transactions: Transaction[]
): number {
  const byId = budget.categoryId.trim();
  const byName = normalizeCategoryKey(budget.categoryName);

  return transactions.reduce((sum, transaction) => {
    if (transaction.type !== 'expense') return sum;
    if (!isInMonth(new Date(transaction.date), budget.monthKey)) return sum;

    const txCategoryRaw = `${transaction.category || ''}`.trim();
    const txCategoryNormalized = normalizeCategoryKey(txCategoryRaw);

    const matches = txCategoryRaw === byId || txCategoryNormalized === byName;
    return matches ? sum + Math.max(0, Number(transaction.amount || 0)) : sum;
  }, 0);
}

export function withBudgetProgress(budgets: BudgetModel[], transactions: Transaction[]): BudgetWithProgress[] {
  return budgets.map((budget) => {
    const spent = getBudgetSpentAmount(budget, transactions);
    const remaining = budget.monthlyLimit - spent;
    const rawProgress = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
    const progressPercent = Math.max(0, Number(rawProgress.toFixed(1)));

    return {
      ...budget,
      spent,
      remaining,
      progressPercent,
      isNearLimit: spent >= budget.monthlyLimit * 0.8 && spent <= budget.monthlyLimit,
      isOverBudget: spent > budget.monthlyLimit,
    };
  });
}

export function getBudgetSummary(items: BudgetWithProgress[]): BudgetSummary {
  const totalBudget = items.reduce((sum, item) => sum + item.monthlyLimit, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
  const overBudgetCount = items.filter((item) => item.isOverBudget).length;
  const nearLimitCount = items.filter((item) => item.isNearLimit).length;

  return {
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    overBudgetCount,
    nearLimitCount,
  };
}
