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
  async seedForUser(userId: string, onProgress?: (status: string) => void) {
    const results: Record<string, any> = {};
    const steps: Array<{ step: number; name: string; success: boolean; detail?: any }> = [];
    let stepCounter = 0;
    const TOTAL_STEPS = 14;

    async function runStep(name: string, fn: () => Promise<any>) {
      stepCounter += 1;
      const stepNum = stepCounter;
      console.log(`[DevAudit][STEP ${stepNum}/${TOTAL_STEPS}] START: ${name}`, { userId });
      if (onProgress) {
        onProgress(`Step ${stepNum}/${TOTAL_STEPS}: ${name}`);
      }
      try {
        const res = await fn();
        const ok = !(res && res.success === false);
        steps.push({ step: stepNum, name, success: ok, detail: res });
        console.log(`[DevAudit][STEP ${stepNum}/${TOTAL_STEPS}] ${ok ? 'PASS' : 'FAIL'}: ${name}`, { result: res });
        return res;
      } catch (err: any) {
        steps.push({ step: stepNum, name, success: false, detail: { error: err?.message || String(err) } });
        console.error(`[DevAudit][STEP ${stepNum}/${TOTAL_STEPS}] FAIL: ${name}`, { error: err?.message || String(err) });
        throw err;
      }
    }

    try {
      // create a main account
      const accResp = await runStep('create account', () => accountsService.createAccount(userId, {
        name: 'KVB savings_account',
        accountType: 'savings' as any,
        currentBalance: 60055.25,
        currency: 'INR',
      }));
      results.account = accResp;

      const accountId = accResp.success && accResp.data ? accResp.data.id : undefined;

      const notifTypes = [
        { type: 'transaction_alert', title: 'Transaction received', message: 'You got a test transaction' },
        { type: 'budget_alert', title: 'Budget Alert', message: 'You are close to budget' },
        { type: 'goal_alert', title: 'Goal progress', message: 'Your goal received a contribution' },
      ];

      // Run all other seeding operations in parallel
      await Promise.all([
        (async () => {
          if (accountId) {
            const [t1, t2] = await Promise.all([
              runStep('create transaction 1', () => transactionsService.createTransaction(userId, {
                accountId,
                amount: 499.5,
                type: 'expense' as any,
                category: 'groceries',
                description: 'Test grocery purchase',
                date: new Date(),
              })),
              runStep('create transaction 2', () => transactionsService.createTransaction(userId, {
                accountId,
                amount: 2500,
                type: 'income' as any,
                category: 'salary',
                description: 'Test salary credit',
                date: new Date(),
              }))
            ]);
            results.transactions = { t1, t2 };
          }
        })(),
        (async () => {
          const monthKey = new Date().toISOString().slice(0, 7);
          results.budget = await runStep('upsert budget', () => budgetsService.upsertBudget(userId, {
            monthKey: monthKey,
            categoryId: 'cat_groceries',
            categoryName: 'Groceries',
            categoryIcon: '🍎',
            monthlyLimit: 5000,
            currency: 'INR',
          } as any));
        })(),
        (async () => {
          results.goal = await runStep('create goal', () => goalsService.createGoal(userId, {
            title: 'New Laptop',
            targetAmount: 90000,
            savedAmount: 15000,
            currency: 'INR',
            description: 'Save for a dev laptop',
          } as any));
        })(),
        (async () => {
          results.investment = await runStep('create investment', () => investmentsService.createInvestment(userId, {
            name: 'Test SIP',
            amount: 10000,
            currency: 'INR',
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          results.asset = await runStep('save asset', () => assetService.saveAsset(userId, null, {
            name: 'Fixed Deposit',
            currentValue: 50000,
            currency: 'INR',
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          results.subscription = await runStep('upsert subscription', () => subscriptionsService.upsertSubscription(userId, {
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
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          results.event = await runStep('upsert event', () => eventsService.upsertEvent(userId, {
            title: 'Test reminder',
            date: new Date(),
            notes: 'Follow up',
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          results.import = await runStep('create import history', () => importService.createImportHistory(userId, {
            fileName: 'bank.csv',
            fileSize: 1024,
            templateUsed: 'default',
            importedCount: 2,
            skippedCount: 0,
            errorCount: 0,
            status: 'completed',
            accountId: accountId || '',
            accountName: 'KVB savings_account',
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          results.emi = await runStep('upsert emi', () => emiService.upsertEMI(userId, {
            lender: 'Test Bank',
            monthlyInstallment: 5000,
            title: 'Test EMI',
            dueDate: new Date().getDate(),
          } as any)).catch((e) => ({ success: false, error: e?.message || String(e) }));
        })(),
        (async () => {
          const notifResults: any[] = [];
          await Promise.all(notifTypes.map(async (n) => {
            try {
              const id = await runStep(`create notification: ${n.type}`, () => notificationsService.createNotification(userId, n.type as any, n.title, n.message, 'medium', { seededBy: 'dev-audit' }));
              notifResults.push({ id, success: true });
            } catch (e: any) {
              notifResults.push({ success: false, error: e?.message || String(e) });
            }
          }));
          results.notifications = notifResults;
        })()
      ]);

      // attach steps trace to results for easier auditing
      (results as any)._seedTrace = steps;
      return results;
    } catch (error: any) {
      console.error('[DevAudit] seedForUser FAILED', { userId, error: error?.message || String(error), steps });
      return { success: false, error: error?.message || String(error), _seedTrace: steps };
    }
  },
};

export default DevAuditService;
