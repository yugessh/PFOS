import type { ReactNode } from 'react';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  icon?: string;
}

export interface EMI {
  id: string;
  name: string;
  principalAmount: number;
  monthlyPayment: number;
  remainingAmount: number;
  rateOfInterest: number;
  startDate: Date;
  endDate: Date;
  monthsRemaining: number;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  category: string;
}

/** Monthly series for income vs spending charts (e.g. `IncomeExpenseChart`). */
export interface MonthlySpendingRow {
  month: string;
  spending: number;
  income: number;
}

/** Slice for expense allocation charts (e.g. `ExpensePieChart`). */
export interface ExpenseBreakdownItem {
  category: string;
  value: number;
  percentage: number;
}

export type StatCardTrend = 'positive' | 'negative' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  /** Display text for period-over-period or contextual change, e.g. "+8.2% vs last month" */
  change?: string;
  icon?: ReactNode;
  trend: StatCardTrend;
  /** Supporting line shown under the change row */
  description?: string;
  className?: string;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Header control(s), e.g. period selector or export button */
  action?: ReactNode;
  /** Optional footnote, legend summary, or metadata */
  footer?: ReactNode;
  className?: string;
}
