import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { SettlementModel } from '../../lib/settlements';

export class SettlementsService extends BaseFirestoreService<SettlementModel> {
  constructor() {
    super(COLLECTIONS.SETTLEMENTS);
  }

  async getUserSettlements(userId: string) {
    return this.getByUserId(userId);
  }

  async createSettlement(userId: string, settlement: Omit<SettlementModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) {
    const payload = {
      ...settlement,
      userId,
    };
    return this.create(payload as any);
  }

  async updateSettlement(settlementId: string, settlement: Partial<SettlementModel>) {
    return this.update(settlementId, settlement as any);
  }

  async deleteSettlement(settlementId: string) {
    return this.delete(settlementId);
  }

  async markAsPaid(settlementId: string, paidDate: Date = new Date()) {
    return this.update(settlementId, { isPaid: true, paidDate } as any);
  }

  async getPendingSettlements(userId: string) {
    const settlements = await this.getUserSettlements(userId);
    if (!settlements.success) return [];
    
    return settlements.data?.filter(s => !s.isPaid) || [];
  }

  async getTotalPending(userId: string) {
    const pending = await this.getPendingSettlements(userId);
    return pending.reduce((sum, s) => sum + s.amount, 0);
  }
}

export const settlementsService = new SettlementsService();
