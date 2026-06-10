import { accountsService } from './firestore/accounts.service';
import { transactionsService } from './firestore/transactions.service';
import { budgetsService } from './firestore/budgets.service';
import { goalsService } from './firestore/goals.service';
import { investmentsService } from './firestore/investments.service';
import { assetService } from './firestore/asset.service';
import { subscriptionsService } from './firestore/subscriptions.service';
import { notificationsService } from './firestore/notifications.service';
import { emiService } from './firestore/emi.service';
import { importService } from './firestore/import.service';
import { eventsService } from './firestore/events.service';

const DevAuditService = {
  async seedForUser(userId: string) {
    const results: Record<string, any> = {};
    try {
      // create a main account
      const accResp = await accountsService.createAccount(userId, {
        name: 'KVB savings_account',
        accountType: 'savings' as any,
        currentBalance: 60055.25,
        currency: 'INR',
      });
      results.account = accResp;

      const accountId = accResp.success && accResp.data ? accResp.data.id : undefined;

      // create a couple of transactions
      if (accountId) {
        const t1 = await transactionsService.createTransaction(userId, {
          accountId,
          amount: 499.5,
          type: 'expense' as any,
          category: 'groceries',
          description: 'Test grocery purchase',
          date: new Date(),
        });
        const t2 = await transactionsService.createTransaction(userId, {
          accountId,
          amount: 2500,
          type: 'income' as any,
          category: 'salary',
          description: 'Test salary credit',
          date: new Date(),
        });
        results.transactions = { t1, t2 };
      }

      // add a budget
      const monthKey = new Date().toISOString().slice(0, 7).replace('-', '-');
      const b = await budgetsService.upsertBudget(userId, {
        monthKey: monthKey,
        categoryId: 'cat_groceries',
        categoryName: 'Groceries',
        categoryIcon: '🍎',
        monthlyLimit: 5000,
        currency: 'INR',
      } as any);
      results.budget = b;

      // create a goal
      const g = await goalsService.createGoal(userId, {
        title: 'New Laptop',
        targetAmount: 90000,
        savedAmount: 15000,
        currency: 'INR',
        description: 'Save for a dev laptop',
      } as any);
      results.goal = g;

      // create an investment entry
      const inv = await investmentsService.createInvestment(userId, {
        name: 'Test SIP',
        amount: 10000,
        currency: 'INR',
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.investment = inv;

      // create an asset
      const asset = await assetService.saveAsset(userId, null, {
        name: 'Fixed Deposit',
        currentValue: 50000,
        currency: 'INR',
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.asset = asset;

      // add a subscription
      const sub = await subscriptionsService.upsertSubscription(userId, {
        name: 'Netflix',
        amount: 499,
        currency: 'INR',
        frequency: 'monthly',
        billingCycleStart: new Date().toISOString(),
        nextRenewalDate: new Date().toISOString(),
        status: 'active',
        paymentMethod: 'card',
        usageFrequency: 'high',
        priceHistory: [],
        autoRenew: true,
        isDetected: false,
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.subscription = sub;

      // create sample events
      const ev = await eventsService.upsertEvent(userId, {
        title: 'Test reminder',
        date: new Date(),
        notes: 'Follow up',
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.event = ev;

      // import record
      const im = await importService.createImportHistory(userId, {
        fileName: 'bank.csv',
        fileSize: 1024,
        templateUsed: 'default',
        importedCount: 2,
        skippedCount: 0,
        errorCount: 0,
        status: 'completed',
        accountId: accountId || '',
        accountName: 'KVB savings_account',
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.import = im;

      // create EMI entry
      const eResp = await emiService.upsertEMI(userId, {
        lender: 'Test Bank',
        monthlyInstallment: 5000,
        title: 'Test EMI',
        dueDate: new Date().getDate(),
      } as any).catch((e) => ({ success: false, error: e?.message || String(e) }));
      results.emi = eResp;

      // create notifications for many types
      const notifTypes = [
        { type: 'transaction_alert', title: 'Transaction received', message: 'You got a test transaction' },
        { type: 'budget_alert', title: 'Budget Alert', message: 'You are close to budget' },
        { type: 'goal_alert', title: 'Goal progress', message: 'Your goal received a contribution' },
        { type: 'investment_alert', title: 'Investment update', message: 'Your investment updated' },
        { type: 'security_alert', title: 'Security event', message: 'New device signed in' },
        { type: 'ai_alert', title: 'AI Insight', message: 'AI found a saving opportunity' },
        { type: 'import_alert', title: 'Import completed', message: 'Bank import finished' },
        { type: 'emi_alert', title: 'EMI due', message: 'Your EMI is due soon' },
        { type: 'subscription_alert', title: 'Subscription', message: 'Subscription renewed' },
        { type: 'system_alert', title: 'System', message: 'Test system notification' },
      ];

      const notifResults: any[] = [];
      for (const n of notifTypes) {
        try {
          const id = await notificationsService.createNotification(userId, n.type as any, n.title, n.message, 'medium', { seededBy: 'dev-audit' });
          notifResults.push({ id, success: true });
        } catch (e: any) {
          notifResults.push({ success: false, error: e?.message || String(e) });
        }
      }
      results.notifications = notifResults;

      return results;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error) };
    }
  },
};

export default DevAuditService;
