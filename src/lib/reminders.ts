export type ReminderType = 'bill' | 'subscription' | 'insurance' | 'rent' | 'utility' | 'other';

export interface ReminderModel {
  id: string;
  userId: string;
  title: string;
  type: ReminderType;
  amount?: number | null;
  dueDate: Date;
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  accountId?: string | null;
  category: string;
  notes?: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  reminderDaysBefore: number;
  isActive: boolean;
  isPaid: boolean;
  paidDate?: Date | null;
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ReminderAlert {
  reminderId: string;
  title: string;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  amount?: number | null;
  type: ReminderType;
}

export function getReminderAlerts(reminders: ReminderModel[]): ReminderAlert[] {
  const alerts: ReminderAlert[] = [];
  const now = new Date();

  for (const reminder of reminders) {
    if (!reminder.isActive || reminder.isPaid) continue;

    const dueDate = new Date(reminder.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;

    if (isOverdue || daysUntilDue <= reminder.reminderDaysBefore) {
      alerts.push({
        reminderId: reminder.id,
        title: reminder.title,
        dueDate,
        daysUntilDue: Math.abs(daysUntilDue),
        isOverdue,
        amount: reminder.amount,
        type: reminder.type,
      });
    }
  }

  return alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function getUpcomingReminders(reminders: ReminderModel[]): ReminderModel[] {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return reminders
    .filter((reminder) => {
      if (!reminder.isActive || reminder.isPaid) return false;
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}