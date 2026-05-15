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
import { getMonthKey } from '@/src/lib/budgets';
import type { Transaction, RecurringTransaction } from '@/src/types/firestore';
import type { Account } from './accounts.service';
import type { BudgetModel } from '@/src/lib/budgets';
import type { EMIModel } from '@/src/lib/emi';
import type { ReminderModel } from '@/src/lib/reminders';

export class SmartAlertEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateAlerts(): Promise<void> {
    try {
      // Get all necessary data with proper error handling
      const [
        transactionsResponse,
        accountsResponse,
        budgetsResponse,
        emisResponse,
        remindersResponse,
        recurringResponse
      ] = await Promise.all([
        transactionsService.getUserTransactions(this.userId).catch(err => {
          console.error('Error fetching transactions:', err);
          return { success: false, error: 'Failed to fetch transactions' };
        }),
        accountsService.getUserAccounts(this.userId).catch(err => {
          console.error('Error fetching accounts:', err);
          return { success: false, error: 'Failed to fetch accounts' };
        }),
        budgetsService.getUserBudgets(this.userId, getMonthKey()).catch(err => {
          console.error('Error fetching budgets:', err);
          return { success: false, error: 'Failed to fetch budgets' };
        }),
        emiService.getUserEMIs(this.userId).catch(err => {
          console.error('Error fetching EMIs:', err);
          return { success: false, error: 'Failed to fetch EMIs' };
        }),
        remindersService.getUserReminders(this.userId).catch(err => {
          console.error('Error fetching reminders:', err);
          return { success: false, error: 'Failed to fetch reminders' };
        }),
        recurringTransactionsService.getUserRecurringTransactions(this.userId).catch(err => {
          console.error('Error fetching recurring transactions:', err);
          return { success: false, error: 'Failed to fetch recurring transactions' };
        }),
      ]);

      // Extract data with fallbacks to empty arrays
      const transactions: Transaction[] = transactionsResponse.success ? ((transactionsResponse as any).data?.data as Transaction[]) || [] : [];
      const accounts: Account[] = accountsResponse.success ? ((accountsResponse as any).data?.data as Account[]) || [] : [];
      const budgets: BudgetModel[] = budgetsResponse.success ? ((budgetsResponse as any).data?.data as BudgetModel[]) || [] : [];
      const emis: EMIModel[] = emisResponse.success ? ((emisResponse as any).data?.data as EMIModel[]) || [] : [];
      const reminders: ReminderModel[] = remindersResponse.success ? ((remindersResponse as any).data?.data as ReminderModel[]) || [] : [];
      const recurring: RecurringTransaction[] = recurringResponse.success ? ((recurringResponse as any).data?.data as RecurringTransaction[]) || [] : [];

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
      // Don't throw - we want the app to continue working even if alerts fail
    }
  }

  private async generateBudgetAlerts(transactions: Transaction[], budgets: BudgetModel[]): Promise<void> {
    if (!Array.isArray(budgets) || budgets.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No budgets available for alert generation');
      }
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const budget of budgets) {
      if (!budget || !budget.isActive) continue;

      // Calculate spent amount for current month
      const monthlyTransactions = transactions.filter(t => {
        if (!t || !t.date || !t.category) return false;
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth &&
               txDate.getFullYear() === currentYear &&
               t.category === budget.categoryName;
      });

      const spent = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      const budgetAmount = budget.monthlyLimit || 0;

      if (budgetAmount <= 0) continue;

      const percentage = (spent / budgetAmount) * 100;
      const categoryLabel = budget.categoryName || 'budget';

      // Alert if over budget or close to limit
      if (percentage >= 100) {
        await this.createAlertIfNotExists(
          `budget_overspend_${budget.id}_${currentMonth}_${currentYear}`,
          'budget_overspend',
          'Budget Exceeded',
          `You've exceeded your ${categoryLabel} budget by ₹${(spent - budgetAmount).toLocaleString()}`,
          'high',
          { budgetId: budget.id, spent, budget: budgetAmount, category: categoryLabel },
          `/dashboard/budgets`
        );
      } else if (percentage >= 80) {
        await this.createAlertIfNotExists(
          `budget_warning_${budget.id}_${currentMonth}_${currentYear}`,
          'budget_overspend',
          'Budget Warning',
          `You're ${percentage.toFixed(0)}% through your ${categoryLabel} budget (₹${spent.toLocaleString()} of ₹${budgetAmount.toLocaleString()})`,
          'medium',
          { budgetId: budget.id, spent, budget: budgetAmount, category: categoryLabel },
          `/dashboard/budgets`
        );
      }
    }
  }

  private async generateLowBalanceAlerts(accounts: Account[]): Promise<void> {
    if (!Array.isArray(accounts) || accounts.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No accounts available for low balance alert generation');
      }
      return;
    }

    const LOW_BALANCE_THRESHOLD = 1000; // ₹1000

    for (const account of accounts) {
      if (!account || !account.isActive || (account.balance || 0) >= LOW_BALANCE_THRESHOLD) continue;

      await this.createAlertIfNotExists(
        `low_balance_${account.id}`,
        'low_balance',
        'Low Account Balance',
        `${account.name || 'Account'} has low balance: ₹${(account.balance || 0).toLocaleString()}`,
        'high',
        { accountId: account.id, balance: account.balance, accountName: account.name },
        `/dashboard/accounts`
      );
    }
  }

  private async generateEMIAlerts(emis: EMIModel[]): Promise<void> {
    if (!Array.isArray(emis) || emis.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No EMIs available for alert generation');
      }
      return;
    }

    const alerts = getEMIAlerts(emis);

    for (const alert of alerts) {
      if (!alert) continue;

      const alertId = `emi_${alert.emiId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'emi_overdue' : 'emi_upcoming';
      const title = alert.isOverdue ? 'EMI Overdue' : 'EMI Due Soon';
      const message = alert.isOverdue
        ? `Your ${alert.title || 'EMI'} payment is ${alert.daysUntilDue || 0} days overdue`
        : `Your ${alert.title || 'EMI'} payment is due in ${alert.daysUntilDue || 0} days`;

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
    if (!Array.isArray(reminders) || reminders.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No reminders available for alert generation');
      }
      return;
    }

    const alerts = getReminderAlerts(reminders);

    for (const alert of alerts) {
      if (!alert) continue;

      const alertId = `reminder_${alert.reminderId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'bill_reminder' : 'bill_reminder';
      const title = alert.isOverdue ? 'Bill Overdue' : 'Bill Due Soon';
      const message = alert.isOverdue
        ? `Your ${alert.title || 'bill'} payment is ${alert.daysUntilDue || 0} days overdue`
        : `Your ${alert.title || 'bill'} payment is due in ${alert.daysUntilDue || 0} days`;

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
    if (!Array.isArray(recurring) || recurring.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No recurring transactions available for alert generation');
      }
      return;
    }

    const alerts = getRecurringAlerts(recurring);

    for (const alert of alerts) {
      if (!alert) continue;

      const alertId = `recurring_${alert.recurringId}_${alert.dueDate.toISOString().split('T')[0]}`;
      const type = alert.isOverdue ? 'recurring_reminder' : 'recurring_reminder';
      const title = alert.isOverdue ? 'Recurring Payment Overdue' : 'Recurring Payment Due';
      const message = alert.isOverdue
        ? `Your ${alert.title || 'recurring payment'} is ${alert.daysUntilDue || 0} days overdue`
        : `Your ${alert.title || 'recurring payment'} is due in ${alert.daysUntilDue || 0} days`;

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
        },
        `/dashboard/recurring`
      );
    }
  }

  private async generateOverspendingAlerts(transactions: Transaction[]): Promise<void> {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No transactions available for overspending alert generation');
      }
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's transactions
    const todayTransactions = transactions.filter(t => {
      if (!t || !t.date) return false;
      const txDate = new Date(t.date);
      return txDate >= today && txDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const todaySpent = todayTransactions
      .filter(t => (t.amount || 0) < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    // Get yesterday's transactions for comparison
    const yesterdayTransactions = transactions.filter(t => {
      if (!t || !t.date) return false;
      const txDate = new Date(t.date);
      return txDate >= yesterday && txDate < today;
    });

    const yesterdaySpent = yesterdayTransactions
      .filter(t => (t.amount || 0) < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

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
      if (!alertId || !type || !title || !message) {
        console.warn('Invalid alert parameters:', { alertId, type, title, message });
        return;
      }

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

        if (process.env.NODE_ENV === 'development') {
          console.debug('Created alert:', { alertId, type, title });
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.debug('Alert already exists, skipping:', alertId);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      // Don't throw - we want alert generation to continue even if one alert fails
    }
  }
}