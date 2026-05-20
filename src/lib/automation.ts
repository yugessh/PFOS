export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export type AutomationType =
  | 'Recurring Expense'
  | 'Recurring Income'
  | 'EMI Reminder'
  | 'Subscription Reminder'
  | 'Goal Contribution'
  | 'Investment Reminder'
  | 'Bill Reminder'
  | 'Custom Workflow';

export interface AutomationCondition {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'contains';
  value: any;
}

export interface AutomationAction {
  actionType: string; // e.g., 'notify', 'createReminder', 'createTransaction'
  params?: Record<string, any>;
}

export interface AutomationModel {
  id?: string;
  automationName: string;
  automationType: AutomationType;
  frequency: Frequency | { type: 'CUSTOM'; cron?: string };
  linkedModule?: string;
  nextRunDate?: Date | null;
  enabled: boolean;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  createdAt?: Date | any;
}
