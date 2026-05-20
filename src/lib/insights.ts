import type { BaseDocument } from '@/src/types/firestore';

export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';

export type InsightType =
  | 'Spending Pattern'
  | 'Budget Alert'
  | 'Goal Prediction'
  | 'EMI Reminder'
  | 'Subscription Warning'
  | 'Investment Trend'
  | 'Trading Performance'
  | 'Savings Suggestion'
  | 'Cashflow Warning'
  | 'Custom Insight';

export interface InsightModel extends BaseDocument {
  userId: string;
  insightType: InsightType;
  title: string;
  description: string;
  priority: InsightPriority;
  sourceModule?: string;
  status?: 'active' | 'dismissed' | 'archived';
}
