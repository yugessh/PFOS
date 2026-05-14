export interface EMIModel {
  id: string;
  userId: string;
  title: string;
  loanAmount: number;
  monthlyInstallment: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDate: number; // Day of month (1-31)
  accountId: string;
  category: string;
  startDate: Date;
  endDate?: Date | null;
  notes?: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  reminderDaysBefore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface EMIAlert {
  emiId: string;
  title: string;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  amount: number;
  remainingInstallments: number;
}

export interface EMIPayment {
  id: string;
  emiId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date | null;
  isPaid: boolean;
  transactionId?: string | null;
}

export function calculateEMIProgress(emi: EMIModel) {
  const now = new Date();
  const startDate = new Date(emi.startDate);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();

  const monthsElapsed = (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1;
  const paid = Math.min(emi.paidInstallments, emi.totalInstallments);
  const remaining = emi.totalInstallments - paid;
  const progress = (paid / emi.totalInstallments) * 100;

  return {
    paid,
    total: emi.totalInstallments,
    remaining,
    progress: Math.min(progress, 100),
    isCompleted: paid >= emi.totalInstallments,
    monthsElapsed,
  };
}

export function getEMIAlerts(emis: EMIModel[]): EMIAlert[] {
  const alerts: EMIAlert[] = [];
  const now = new Date();

  for (const emi of emis) {
    if (!emi.isActive) continue;

    const progress = calculateEMIProgress(emi);
    if (progress.isCompleted) continue;

    const startDate = new Date(emi.startDate);
    const nextDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + progress.paid, emi.dueDate);

    // If due date is in the past, it's the current month
    if (nextDueDate < now) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    const daysUntilDue = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;

    if (isOverdue || daysUntilDue <= emi.reminderDaysBefore) {
      alerts.push({
        emiId: emi.id,
        title: emi.title,
        dueDate: nextDueDate,
        daysUntilDue: Math.abs(daysUntilDue),
        isOverdue,
        amount: emi.monthlyInstallment,
        remainingInstallments: progress.remaining,
      });
    }
  }

  return alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}