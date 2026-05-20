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

export interface InsightModel {
  id?: string;
  userId?: string;
  insightType: InsightType;
  title: string;
  description: string;
  priority: InsightPriority;
  sourceModule?: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  status?: 'active' | 'dismissed' | 'archived';
}
