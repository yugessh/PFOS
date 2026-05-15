import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { InvestmentModel } from '../../lib/investments';

export class InvestmentsService extends BaseFirestoreService<InvestmentModel> {
  constructor() {
    super(COLLECTIONS.INVESTMENTS);
  }

  async getUserInvestments(userId: string) {
    return this.getByUserId(userId);
  }

  async createInvestment(userId: string, investment: Omit<InvestmentModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) {
    const payload = {
      ...investment,
      userId,
    };
    return this.create(payload as any);
  }

  async updateInvestment(investmentId: string, investment: Partial<InvestmentModel>) {
    return this.update(investmentId, investment as any);
  }

  async deleteInvestment(investmentId: string) {
    return this.delete(investmentId);
  }

  async getInvestmentsByType(userId: string, type: InvestmentModel['type']) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'type', operator: '==', value: type },
      ],
    });
  }

  async getTotalInvested(userId: string) {
    const investments = await this.getUserInvestments(userId);
    if (!investments.success) return 0;
    return investments.data?.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0) || 0;
  }

  async getTotalCurrentValue(userId: string) {
    const investments = await this.getUserInvestments(userId);
    if (!investments.success) return 0;
    return investments.data?.reduce((sum, inv) => sum + (inv.currentValue || 0), 0) || 0;
  }
}

export const investmentsService = new InvestmentsService();
