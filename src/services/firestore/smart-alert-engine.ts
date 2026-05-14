import { notificationsService } from './notifications.service';
import { transactionsService } from './transactions.service';
import { accountsService } from './accounts.service';
import { budgetsService } from './budgets.service';
import { emiService } from './emi.service';
import { remindersService } from './reminders.service';
import { recurringTransactionsService } from './recurring-transactions.service';
import { getEMIAlerts } from '@/src/lib/emi';
import { getReminderAlerts } from '@/src/lib/reminders';
import { getRecurringAlerts } from '@/src/lib/recurring';
import type { Transaction } from './transactions.service';
import type { Account } from './accounts.service';
import type { Budget } from './budgets.service';
import type { EMIModel } from '@/src/lib/emi';
import type { ReminderModel } from '@/src/lib/reminders';
import type { RecurringTransaction } from './recurring-transactions.service';

export class SmartAlertEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateAlerts(): Promise<void> {
    try {
      // Get all necessary data
      const [transactions, accounts, budgets, emis, reminders, recurring] = await Promise.all([
        transactionsService.getUserTransactions(this.userId),
        accountsService.getUserAccounts(this.userId),
        budgetsService.getUserBudgets(this.userId),
        emiService.getUserEMIs(this.userId),
        remindersService.getUserReminders(this.userId),
        recurringTransactionsService.getUserRecurringTransactions(this.userId),
      ]);

      // Generate different types of alerts
      await Promise.all([
        this.generateBudgetAlerts(transactions, budgets),
        this.generateLowBalanceAlerts(accounts),
        this.generateEMIAlerts(emis),
        this.generateReminderAlerts(reminders),
        this.generateRecurringAlerts(recurring),
        this.generateOverspendingAlerts(transactions),
      ]);
    } catch (error) {
      console.error('Error generating smart alerts:', error);
    }
  }

  private async generateBudgetAlerts(transactions: Transaction[], budgets: Budget[]): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const budget of budgets) {
      if (!budget.isActive) continue;

      // Calculate spent amount for current month
      const monthlyTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth &&
               txDate.getFullYear() === currentYear &&
               t.category === budget.category;
      });

      const spent = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const percentage = (spent / budget.amount) * 100;

      // Alert if over budget or close to limit
      if (percentage >= 100) {
        await this.createAlertIfNotExists(
          `budget_overspend_${budget.id}_${currentMonth}_${currentYear}`,
          'budget_overspend',
          'Budget Exceeded',
          `You've exceeded your ${budget.category} budget by ₹${(spent - budget.amount).toLocaleString()}`,
          'high',
          { budgetId: budget.id, spent, budget: budget.amount, category: budget.category },
          `/dashboard/budgets`
        );
      } else if (percentage >= 80) {
        await this.createAlertIfNotExists(
          `budget_warning_${budget.id}_${currentMonth}_${currentYear}`,
          'budget_overspend',
          'Budget Warning',
          `You're ${percentage.toFixed(0)}% through your ${budget.category} budget (₹${spent.toLocaleString()} of ₹${budget.amount.toLocaleString()})`,
          'medium',
          { budgetId: budget.id, spent, budget: budget.amount, category: budget.category },
          `/dashboard/budgets`
        );
      }
    }
  }

  private async generateLowBalanceAlerts(accounts: Account[]): Promise<void> {
    const LOW_BALANCE_THRESHOLD = 1000; // ₹1000

    for (const account of accounts) {
      if (!account.isActive || (account.balance || 0) >= LOW_BALANCE_THRESHOLD) continue;

      await this.createAlertIfNotExists(
        `low_balance_${account.id}`,
        'low_balance',
        'Low Account Balance',
        `${account.name} has low balance: ₹${(account.balance || 0).toLocaleString()}`,
        'high',
        { accountId: account.id, balance: account.balance, accountName: account.name },
        `/dashboard/accounts`
      );
    }
  }

  private async generateEMIAlerts(emis: EMIModel[]): Promise<void> {
    const alerts = getEMIAlerts(emis);

    for (const alert of alerts) {
      const alertId = `emi_${alert.emiId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'emi_overdue' : 'emi_upcoming';
      const title = alert.isOverdue ? 'EMI Overdue' : 'EMI Due Soon';
      const message = alert.isOverdue
        ? `Your ${alert.title} EMI payment is ${alert.daysUntilDue} days overdue`
        : `Your ${alert.title} EMI payment is due in ${alert.daysUntilDue} days`;

      await this.createAlertIfNotExists(
        alertId,
        type,
        title,
        message,
        alert.isOverdue ? 'urgent' : 'high',
        {
          emiId: alert.emiId,
          amount: alert.amount,
          dueDate: alert.dueDate,
          daysUntilDue: alert.daysUntilDue,
          isOverdue: alert.isOverdue
        },
        `/dashboard/emi`
      );
    }
  }

  private async generateReminderAlerts(reminders: ReminderModel[]): Promise<void> {
    const alerts = getReminderAlerts(reminders);

    for (const alert of alerts) {
      const alertId = `reminder_${alert.reminderId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'bill_reminder' : 'bill_reminder';
      const title = alert.isOverdue ? 'Bill Overdue' : 'Bill Due Soon';
      const message = alert.isOverdue
        ? `Your ${alert.title} payment is ${alert.daysUntilDue} days overdue`
        : `Your ${alert.title} payment is due in ${alert.daysUntilDue} days`;

      await this.createAlertIfNotExists(
        alertId,
        type,
        title,
        message,
        alert.isOverdue ? 'urgent' : 'medium',
        {
          reminderId: alert.reminderId,
          amount: alert.amount,
          dueDate: alert.dueDate,
          daysUntilDue: alert.daysUntilDue,
          isOverdue: alert.isOverdue,
          type: alert.type
        },
        `/dashboard/reminders`
      );
    }
  }

  private async generateRecurringAlerts(recurring: RecurringTransaction[]): Promise<void> {
    const alerts = getRecurringAlerts(recurring);

    for (const alert of alerts) {
      const alertId = `recurring_${alert.recurringId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'recurring_reminder' : 'recurring_reminder';
      const title = alert.isOverdue ? 'Recurring Payment Overdue' : 'Recurring Payment Due';
      const message = alert.isOverdue
        ? `Your ${alert.title} recurring payment is ${alert.daysUntilDue} days overdue`
        : `Your ${alert.title} recurring payment is due in ${alert.daysUntilDue} days`;

      await this.createAlertIfNotExists(
        alertId,
        type,
        title,
        message,
        alert.isOverdue ? 'high' : 'medium',
        {
          recurringId: alert.recurringId,
          amount: alert.amount,
          dueDate: alert.dueDate,
          daysUntilDue: alert.daysUntilDue,
          isOverdue: alert.isOverdue,
          frequency: alert.frequency
        },
        `/dashboard/recurring`
      );
    }
  }

  private async generateOverspendingAlerts(transactions: Transaction[]): Promise<void> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's transactions
    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= today && txDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const todaySpent = todayTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get yesterday's transactions for comparison
    const yesterdayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= yesterday && txDate < today;
    });

    const yesterdaySpent = yesterdayTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Alert if spending is significantly higher than yesterday
    if (yesterdaySpent > 0 && todaySpent > yesterdaySpent * 1.5 && todaySpent > 5000) {
      const increase = ((todaySpent - yesterdaySpent) / yesterdaySpent * 100).toFixed(0);
      await this.createAlertIfNotExists(
        `overspending_${today.toISOString().split('T')[0]}`,
        'transaction_alert',
        'High Daily Spending',
        `Today's spending (₹${todaySpent.toLocaleString()}) is ${increase}% higher than yesterday`,
        'medium',
        { todaySpent, yesterdaySpent, date: today },
        `/dashboard/transactions`
      );
    }
  }

  private async createAlertIfNotExists(
    alertId: string,
    type: any,
    title: string,
    message: string,
    priority: any,
    metadata?: Record<string, any>,
    actionUrl?: string
  ): Promise<void> {
    try {
      // Check if alert already exists (by checking recent notifications with similar metadata)
      const existingNotifications = await notificationsService.getUserNotifications(this.userId);
      const existingAlert = existingNotifications.find(n =>
        n.metadata?.alertId === alertId &&
        n.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
      );

      if (!existingAlert) {
        await notificationsService.createNotification(
          this.userId,
          type,
          title,
          message,
          priority,
          { ...metadata, alertId },
          actionUrl,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
        );
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }
}