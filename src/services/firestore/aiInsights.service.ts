import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/src/constants/collections';
import type { InsightModel } from '@/src/lib/insights';

export class AIInsightsService extends BaseFirestoreService<InsightModel> {
  constructor() {
    super(COLLECTIONS.AI_INSIGHTS || 'ai_insights');
  }

  async createInsight(userId: string, insight: Omit<InsightModel, 'id' | 'createdAt'>) {
    const payload = { ...insight, createdAt: new Date(), userId } as any;
    return this.create(payload);
  }

  async getUserInsights(userId: string) {
    return this.getByUserId(userId);
  }

  async dismissInsight(insightId: string) {
    return this.update(insightId, { status: 'dismissed' } as any);
  }
}

export const aiInsightsService = new AIInsightsService();
