import { BaseFirestoreService } from './base.service';
import { COLLECTIONS, SUBCOLLECTIONS } from '../../constants/collections';
import type { InvestmentTransaction } from '../../lib/investments';

export class InvestmentTransactionsService extends BaseFirestoreService<InvestmentTransaction> {
  constructor() {
    super(COLLECTIONS.INVESTMENT_TRANSACTIONS);
  }

  async createTransaction(userId: string, tx: Omit<InvestmentTransaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) {
    const payload = {
      ...tx,
      userId,
    } as any;
    return this.create(payload as any);
  }

  async getTransactionsForInvestment(userId: string, investmentId: string) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'investmentId', operator: '==', value: investmentId },
      ],
      orderBy: { field: 'transactionDate', direction: 'desc' },
    });
  }

  async getUserTransactions(userId: string) {
    return this.getByUserId(userId);
  }
}

export const investmentTransactionsService = new InvestmentTransactionsService();
