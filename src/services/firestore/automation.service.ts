import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/src/constants/collections';
import type { AutomationModel } from '@/src/lib/automation';

export class AutomationsService extends BaseFirestoreService<AutomationModel> {
  constructor() {
    super(COLLECTIONS.AUTOMATIONS || 'automations');
  }

  async createAutomation(userId: string, payload: Omit<AutomationModel, 'id' | 'createdAt'>) {
    const data = { ...payload, createdAt: new Date(), userId } as any;
    return this.create(data);
  }

  async getUserAutomations(userId: string) {
    return this.getByUserId(userId);
  }

  async updateAutomation(automationId: string, patch: Partial<AutomationModel>) {
    return this.update(automationId, patch as any);
  }

  // Lightweight runner stub: find due automations and return them.
  async getDueAutomations(now: Date = new Date()) {
    const all = await this.list({ where: [{ field: 'enabled', operator: '==', value: true }] });
    const items = Array.isArray(all.data) ? all.data : Array.isArray(all.data?.data) ? all.data.data : [];
    const due = (items as AutomationModel[]).filter(a => !a.nextRunDate || new Date(a.nextRunDate) <= now);
    return { success: true, data: due };
  }
}

export const automationsService = new AutomationsService();
