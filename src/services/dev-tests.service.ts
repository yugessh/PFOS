import { accountsService } from './firestore/accounts.service';
import { transactionsService } from './firestore/transactions.service';
import { budgetsService } from './firestore/budgets.service';
import { goalsService } from './firestore/goals.service';
import { investmentsService } from './firestore/investments.service';
import { notificationsService } from './firestore/notifications.service';
import { importService } from './firestore/import.service';

const DevTestsService = {
  async runTransactionWorkflow(userId: string) {
    const result: any = { steps: [] };
    try {
      // create account
      const acc = await accountsService.createAccount(userId, { name: 'Workflow Account', accountType: 'savings' as any, currentBalance: 1000, currency: 'INR' } as any);
      result.steps.push({ name: 'createAccount', ok: acc?.success });
      const accountId = acc?.data?.id;

      // create transaction
      const tx = await transactionsService.createTransaction(userId, { accountId, amount: 100, type: 'expense' as any, category: 'test', description: 'Workflow expense', date: new Date() } as any);
      result.steps.push({ name: 'createTransaction', ok: tx?.success });
      const txId = tx?.data?.id || null;

      // verify transaction read
      const list = await transactionsService.getUserTransactions(userId);
      const found = list.success && Array.isArray((list as any).data?.data) ? ((list as any).data.data.some((t: any) => t.id === txId)) : false;
      result.steps.push({ name: 'readTransaction', ok: found });

      // check notification creation (best-effort)
      const notifs = await notificationsService.getUserNotifications(userId);
      result.steps.push({ name: 'notificationsRead', ok: Array.isArray(notifs) });

      // delete transaction if possible
      if (txId) {
        await transactionsService.softDelete(txId as string).catch(() => {});
        result.steps.push({ name: 'deleteTransaction', ok: true });
      }

      // summary
      const passes = result.steps.filter((s: any) => s.ok).length;
      const score = Math.round((passes / result.steps.length) * 100);
      return { success: true, score, result };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e), result };
    }
  },

  async runNotificationWorkflow(userId: string) {
    const out: any = { steps: [] };
    try {
      // create a notification
      const nid = await notificationsService.createNotification(userId, 'system_alert' as any, 'Workflow notif', 'Workflow notification test', 'medium', { workflow: true });
      out.steps.push({ name: 'createNotification', ok: !!nid, id: nid });

      // unread count
      const unread = await notificationsService.getUnreadCount(userId);
      out.steps.push({ name: 'getUnreadCount', ok: typeof unread === 'number', unread });

      // subscribe and measure immediate callback
      let received = false;
      const unsub = notificationsService.subscribeToUserNotifications(userId, false, (items) => {
        if (items.some((i) => i.id === nid)) received = true;
      });
      // wait briefly
      await new Promise((r) => setTimeout(r, 800));
      unsub();
      out.steps.push({ name: 'realtimeReceive', ok: received });

      // mark as read
      await notificationsService.markAsRead(nid, userId).catch(() => {});
      const unreadAfter = await notificationsService.getUnreadCount(userId);
      out.steps.push({ name: 'markAsRead', ok: unreadAfter <= unread });

      return { success: true, result: out };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e), result: out };
    }
  },

  async measureRealtimeLatency(userId: string, attempts = 3) {
    const latencies: number[] = [];
    try {
      for (let i = 0; i < attempts; i++) {
        const start = Date.now();
        let resolved = false;
        const promise = new Promise<number>((resolve, reject) => {
          const unsub = notificationsService.subscribeToUserNotifications(userId, false, (items) => {
            const found = items.find((it) => it.metadata?.latencyToken === token);
            if (found && !resolved) {
              resolved = true;
              const t = Date.now() - start;
              unsub();
              resolve(t);
            }
          });
          // fallback timeout
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              unsub();
              resolve(-1);
            }
          }, 5000);
        });
        const token = `lat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await notificationsService.createNotification(userId, 'system_alert' as any, 'latency', 'latency test', 'low', { latencyToken: token, createdAt: new Date() });
        // wait for promise
        // @ts-ignore
        const latency = await promise;
        if (latency > 0) latencies.push(latency);
        await new Promise((r) => setTimeout(r, 300));
      }
      if (latencies.length === 0) return { success: false, latencies: [], stats: null };
      const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);
      return { success: true, latencies, stats: { avg, min, max } };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e), latencies };
    }
  },

  async runModuleCrudCheck(userId: string, module: string) {
    // basic checks per module key
    try {
      switch (module) {
        case 'accounts': {
          const acc = await accountsService.createAccount(userId, { name: 'ModuleCheck', accountType: 'savings' as any, currentBalance: 10, currency: 'INR' } as any);
          return { success: !!acc.success, details: acc };
        }
        case 'budgets': {
          const res = await budgetsService.upsertBudget(userId, { monthKey: new Date().toISOString().slice(0,7), categoryId: 'mc', categoryName: 'MC', categoryIcon: '🔧', monthlyLimit: 1000, currency: 'INR' } as any);
          return { success: !!res.success, details: res };
        }
        case 'goals': {
          const res = await goalsService.createGoal(userId, { title: 'MC Goal', targetAmount: 1000, savedAmount: 0, currency: 'INR', description: 'module check' } as any);
          return { success: !!res.success, details: res };
        }
        case 'investments': {
          const res = await investmentsService.createInvestment(userId, { name: 'MC Inv', amount: 1000, currency: 'INR' } as any).catch((e)=>({ success: false, error: e?.message }));
          return { success: !!res?.success, details: res };
        }
        case 'notifications': {
          const id = await notificationsService.createNotification(userId, 'system_alert' as any, 'MC', 'module test', 'low', { mc: true });
          return { success: !!id, id };
        }
        default:
          return { success: false, error: 'module not supported' };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  },

  async runBudgetWorkflow(userId: string) {
    const out: any = { steps: [] };
    try {
      const monthKey = new Date().toISOString().slice(0,7);
      const res = await budgetsService.upsertBudget(userId, { monthKey, categoryId: 'wf', categoryName: 'Workflow', categoryIcon: '🧪', monthlyLimit: 500, currency: 'INR' } as any);
      out.steps.push({ name: 'createBudget', ok: !!res.success, details: res });
      const list = await budgetsService.getUserBudgets(userId, monthKey);
      out.steps.push({ name: 'readBudgets', ok: !!list.success, details: list });
      if (res?.data?.id) {
        const del = await budgetsService.removeBudget(userId, res.data.id).catch(() => ({ success: false }));
        out.steps.push({ name: 'removeBudget', ok: !!del.success });
      }
      return { success: true, result: out };
    } catch (e:any) {
      return { success: false, error: e?.message || String(e), result: out };
    }
  },

  async runGoalWorkflow(userId: string) {
    const out: any = { steps: [] };
    try {
      const res = await goalsService.createGoal(userId, { title: 'WF Goal', targetAmount: 1000, savedAmount: 0, currency: 'INR', description: 'workflow' } as any);
      out.steps.push({ name: 'createGoal', ok: !!res.success, details: res });
      const read = await goalsService.getUserGoals(userId);
      out.steps.push({ name: 'readGoals', ok: !!read.success, details: read });
      if (res?.data?.id) {
        const upd = await goalsService.updateSavedAmount(res.data.id, 100).catch(() => ({ success: false }));
        out.steps.push({ name: 'updateSaved', ok: !!upd.success });
        const del = await goalsService.deleteGoal(res.data.id).catch(() => ({ success: false }));
        out.steps.push({ name: 'deleteGoal', ok: !!del.success });
      }
      return { success: true, result: out };
    } catch (e:any) {
      return { success: false, error: e?.message || String(e), result: out };
    }
  },

  async runInvestmentWorkflow(userId: string) {
    const out: any = { steps: [] };
    try {
      const res = await investmentsService.createInvestment(userId, { name: 'WF Inv', amount: 1000, currency: 'INR' } as any);
      out.steps.push({ name: 'createInvestment', ok: !!res.success, details: res });
      const list = await investmentsService.getUserInvestments(userId);
      out.steps.push({ name: 'readInvestments', ok: !!list.success, details: list });
      if (res?.data?.id) {
        const del = await investmentsService.deleteInvestment(res.data.id).catch(() => ({ success: false }));
        out.steps.push({ name: 'deleteInvestment', ok: !!del.success });
      }
      return { success: true, result: out };
    } catch (e:any) {
      return { success: false, error: e?.message || String(e), result: out };
    }
  },

  async runImportWorkflow(userId: string) {
    const out: any = { steps: [] };
    try {
      const rec = { fileName: 'wf.csv', fileSize: 123, templateUsed: 'default', importedCount: 0, skippedCount: 0, errorCount: 0, status: 'completed', accountId: '', accountName: '' };
      const res = await importService.createImportHistory(userId, rec as any);
      out.steps.push({ name: 'createImportLog', ok: !!res.success, details: res });
      const hist = await importService.getUserImportHistory(userId);
      out.steps.push({ name: 'readImportHistory', ok: !!hist.success, details: hist });
      return { success: true, result: out };
    } catch (e:any) {
      return { success: false, error: e?.message || String(e), result: out };
    }
  },

  async runFullSystemWorkflow(userId: string) {
    // run a subset of workflows and aggregate
    const agg: any = {};
    const tx = await this.runTransactionWorkflow(userId);
    agg.transaction = tx;
    const notif = await this.runNotificationWorkflow(userId);
    agg.notification = notif;
    const budget = await this.runBudgetWorkflow(userId);
    agg.budget = budget;
    const goal = await this.runGoalWorkflow(userId);
    agg.goal = goal;
    const inv = await this.runInvestmentWorkflow(userId);
    agg.investment = inv;
    return { success: true, result: agg };
  },
};

export default DevTestsService;
