export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurringTransactionType = 'income' | 'expense' | 'transfer';

export interface RecurringTransactionModel {
  id: string;
  userId: string;
  title: string;
  type: RecurringTransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string;
  frequency: RecurringFrequency;
  interval: number;
  startDate: Date;
  nextRunDate: Date;
  lastRunDate?: Date | null;
  endDate?: Date | null;
  notes?: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  reminderDaysBefore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface RecurringAlert {
  recurringId: string;
  title: string;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  amount: number;
  type: RecurringTransactionType;
}

export function addFrequency(date: Date, frequency: RecurringFrequency, interval = 1): Date {
  const next = new Date(date);
  const safeInterval = Math.max(1, Math.trunc(interval || 1));

  if (frequency === 'daily') {
    next.setDate(next.getDate() + safeInterval);
    return next;
  }

  if (frequency === 'weekly') {
    next.setDate(next.getDate() + safeInterval * 7);
    return next;
  }

  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + safeInterval);
    return next;
  }

  next.setFullYear(next.getFullYear() + safeInterval);
  return next;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameOrBeforeDay(left: Date, right: Date): boolean {
  return new Date(toDateKey(left)).getTime() <= new Date(toDateKey(right)).getTime();
}

export function getRecurringAlerts(items: RecurringTransactionModel[], now = new Date()): RecurringAlert[] {
  return items
    .filter((item) => item.isActive)
    .map((item) => {
      const due = new Date(item.nextRunDate);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntilDue = Math.floor((new Date(toDateKey(due)).getTime() - new Date(toDateKey(now)).getTime()) / msPerDay);

      return {
        recurringId: item.id,
        title: item.title,
        dueDate: due,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        amount: item.amount,
        type: item.type,
      };
    })
    .filter((alert) => alert.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}
