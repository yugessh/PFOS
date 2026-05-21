import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { SettlementModel, SettlementPayment } from '../../lib/settlements';
import { getSettlementStatus } from '../../lib/settlements';
import { transactionsService } from './transactions.service';
import { accountsService } from './accounts.service';

export class SettlementsService extends BaseFirestoreService<SettlementModel> {
  constructor() {
    super(COLLECTIONS.SETTLEMENTS);
  }

  async getUserSettlements(userId: string) {
    return this.getByUserId(userId);
  }

  async createSettlement(
    userId: string,
    settlement: Omit<SettlementModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
  ) {
    const payload = {
      ...settlement,
      userId,
      remainingAmount: settlement.remainingAmount ?? settlement.amount,
      status: settlement.status ?? getSettlementStatus({
        ...settlement,
        remainingAmount: settlement.remainingAmount ?? settlement.amount,
      }),
      payments: settlement.payments ?? [],
    };
    return this.create(payload as any);
  }

  async updateSettlement(settlementId: string, settlement: Partial<SettlementModel>) {
    const payload: Partial<SettlementModel> = {
      ...settlement,
      ...(settlement.remainingAmount !== undefined || settlement.amount !== undefined || settlement.dueDate !== undefined
        ? {
            status: getSettlementStatus({
              ...settlement,
              remainingAmount: settlement.remainingAmount,
            } as any),
          }
        : {}),
    };
    return this.update(settlementId, payload as any);
  }

  async deleteSettlement(settlementId: string) {
    return this.softDelete(settlementId);
  }

  async applyPayment(
    userId: string,
    settlementId: string,
    payment: {
      amount: number;
      date: Date;
      notes?: string;
      accountId?: string;
      transactionType: 'income' | 'expense';
      description?: string;
    }
  ) {
    const settlementResult = await this.getById(settlementId);
    if (!settlementResult.success || !settlementResult.data) {
      return { success: false, error: 'Settlement not found' };
    }

    const settlement = settlementResult.data;
    if (settlement.userId !== userId) {
      return { success: false, error: 'Unauthorized settlement access' };
    }

    const paymentRecord: SettlementPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount: payment.amount,
      date: payment.date,
      notes: payment.notes,
      accountId: payment.accountId,
      transactionType: payment.transactionType,
      createdAt: new Date(),
    };

    let transactionId: string | undefined;
    if (payment.accountId) {
      const transactionResponse = await transactionsService.createTransaction(userId, {
        userId,
        accountId: payment.accountId,
        amount: payment.amount,
        type: payment.transactionType,
        category:
          payment.transactionType === 'income' ? 'settlement_income' : 'settlement_payment',
        description:
          payment.description ||
          (payment.transactionType === 'income'
            ? `Received payment from ${settlement.personName}`
            : `Paid settlement to ${settlement.personName}`),
        date: payment.date,
      });

      if (transactionResponse.success && transactionResponse.data) {
        transactionId = transactionResponse.data.id;
        paymentRecord.transactionId = transactionId;

        const direction = payment.transactionType === 'income' ? 'inflow' : 'outflow';
        await accountsService.recordAccountMovement(userId, payment.accountId, {
          amount: payment.amount,
          direction,
          description: paymentRecord.notes || transactionResponse.data.description,
          date: payment.date,
        });
      }
    }

    const remainingAmount = Math.max(0, settlement.remainingAmount - payment.amount);
    const updatedStatus = getSettlementStatus({
      ...settlement,
      remainingAmount,
    });

    const updatedSettlement = {
      ...settlement,
      remainingAmount,
      status: updatedStatus,
      lastActivityAt: new Date(),
      payments: [...(settlement.payments ?? []), paymentRecord],
    };

    const result = await this.update(settlementId, updatedSettlement as any);
    return {
      success: result.success,
      data: result.data,
      transactionId,
      error: result.error,
    };
  }

  async getPendingSettlements(userId: string) {
    const settlements = await this.getUserSettlements(userId);
    if (!settlements.success) return [];
    const settlementItems = Array.isArray(settlements.data)
      ? settlements.data
      : Array.isArray(settlements.data?.data)
      ? settlements.data.data
      : [];
    return settlementItems.filter((s) => s.status !== 'completed');
  }

  async getTotalPending(userId: string) {
    const pending = await this.getPendingSettlements(userId);
    return pending.reduce((sum, s) => sum + (s.remainingAmount ?? 0), 0);
  }
}

export const settlementsService = new SettlementsService();
