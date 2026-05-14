import { accountsService } from '@/src/services/firestore/accounts.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { recurringTransactionsService } from '@/src/services/firestore/recurring-transactions.service';
import { addFrequency, isSameOrBeforeDay, toDateKey, type RecurringTransactionModel } from '@/src/lib/recurring';

export interface RecurringAutomationResult {
  generatedCount: number;
  processedTemplates: number;
}

async function applyAccountBalanceForGeneratedTransaction(
  userId: string,
  recurring: RecurringTransactionModel,
  amount: number
) {
  if (recurring.type === 'transfer' && recurring.toAccountId) {
    const fromRes = await accountsService.getAccountById(userId, recurring.accountId);
    const toRes = await accountsService.getAccountById(userId, recurring.toAccountId);

    if (fromRes.success && fromRes.data) {
      await accountsService.updateBalance(userId, recurring.accountId, Number(fromRes.data.balance || 0) - amount);
    }
    if (toRes.success && toRes.data) {
      await accountsService.updateBalance(userId, recurring.toAccountId, Number(toRes.data.balance || 0) + amount);
    }
    return;
  }

  const accRes = await accountsService.getAccountById(userId, recurring.accountId);
  if (!accRes.success || !accRes.data) return;

  const current = Number(accRes.data.balance || 0);
  const next = recurring.type === 'income' ? current + amount : current - amount;
  await accountsService.updateBalance(userId, recurring.accountId, next);
}

export async function runRecurringAutomationForUser(userId: string): Promise<RecurringAutomationResult> {
  const recurringRes = await recurringTransactionsService.getUserRecurringTransactions(userId);
  if (!recurringRes.success) {
    throw new Error(recurringRes.error || 'Failed to load recurring transactions');
  }

  const recurringItems = ((recurringRes.data?.data || []) as RecurringTransactionModel[])
    .filter((item) => item.isActive)
    .sort((a, b) => new Date(a.nextRunDate).getTime() - new Date(b.nextRunDate).getTime());

  let generatedCount = 0;
  let processedTemplates = 0;
  const now = new Date();

  for (const recurring of recurringItems) {
    let occurrence = new Date(recurring.nextRunDate);
    let didProcess = false;
    let lastProcessedOccurrence: Date | null = null;

    while (isSameOrBeforeDay(occurrence, now)) {
      if (recurring.endDate && new Date(occurrence) > new Date(recurring.endDate)) {
        break;
      }

      const occurrenceDateKey = toDateKey(occurrence);
      const exists = await recurringTransactionsService.hasGeneratedTransaction(
        userId,
        recurring.id,
        occurrenceDateKey
      );

      if (!exists) {
        const txPayload = {
          accountId: recurring.accountId,
          ...(recurring.toAccountId ? { toAccount: recurring.toAccountId } : {}),
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.type === 'transfer' ? 'transfer' : recurring.category,
          description: recurring.notes?.trim() || recurring.title,
          date: occurrence,
          isRecurring: true,
          recurringRule: {
            frequency: recurring.frequency,
            interval: recurring.interval,
            ...(recurring.endDate ? { endDate: recurring.endDate } : {}),
          },
          metadata: {
            source: 'recurring_engine',
            recurringTransactionId: recurring.id,
            occurrenceDateKey,
          },
        } as any;

        const created = await transactionsService.createTransaction(userId, txPayload);
        if (created.success) {
          generatedCount += 1;
          await applyAccountBalanceForGeneratedTransaction(userId, recurring, recurring.amount);
        }
      }

      didProcess = true;
      lastProcessedOccurrence = new Date(occurrence);
      occurrence = addFrequency(occurrence, recurring.frequency, recurring.interval);
    }

    if (didProcess && lastProcessedOccurrence) {
      processedTemplates += 1;
      await recurringTransactionsService.markProcessed(userId, recurring.id, {
        nextRunDate: occurrence,
        lastRunDate: lastProcessedOccurrence,
      });
    }
  }

  return { generatedCount, processedTemplates };
}
