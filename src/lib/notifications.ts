export type NotificationType =
  | 'emi_upcoming'
  | 'emi_overdue'
  | 'debt_due'
  | 'debt_overdue'
  | 'budget_overspend'
  | 'low_balance'
  | 'recurring_reminder'
  | 'bill_reminder'
  | 'transaction_alert'
  | 'security'
  | 'budget_alert'
  | 'goal_update'
  | 'investment_change'
  | 'trading_pl_alert'
  | 'emi_reminder'
  | 'bill_due'
  | 'subscription_due'
  | 'security_alert'
  | 'backup_alert'
  | 'ai_recommendation'
  | 'automation_update'
  | 'calendar_event'
  | 'report_ready'
  | 'dashboard_digest'
  | 'lending_update';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'urgent';

export type NotificationModule =
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'investments'
  | 'trading'
  | 'emi'
  | 'bills'
  | 'subscriptions'
  | 'calendar'
  | 'ai'
  | 'automation'
  | 'security'
  | 'lending'
  | 'reports'
  | 'dashboard';

export type NotificationLifecycleState = 'unread' | 'read' | 'pinned' | 'archived' | 'dismissed';

export type NotificationSyncStatus = 'synced' | 'pending' | 'local' | 'queued';

export type NotificationActionType =
  | 'open'
  | 'view_transaction'
  | 'view_report'
  | 'pay_emi'
  | 'dismiss'
  | 'mark_complete'
  | 'add_contribution'
  | 'open_module';

export interface NotificationAction {
  label: string;
  type: NotificationActionType;
  url?: string;
  payload?: Record<string, any>;
}

export interface NotificationModel {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  isPinned?: boolean;
  isDismissed?: boolean;
  module?: NotificationModule;
  groupKey?: string;
  groupLabel?: string;
  sourceModule?: string;
  sourceId?: string;
  priorityScore?: number;
  priorityReason?: string;
  syncStatus?: NotificationSyncStatus;
  action?: NotificationAction;
  metadata?: Record<string, any>;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date | null;
  archivedAt?: Date | null;
  expiresAt?: Date | null;
}

export interface NotificationAlert {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt: Date;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationGroup {
  key: string;
  label: string;
  count: number;
  notifications: NotificationModel[];
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  subtitle: string;
  module: NotificationModule | string;
  priority: NotificationPriority;
  createdAt: Date;
  url?: string;
  tone?: 'critical' | 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

export const NOTIFICATION_MODULE_LABELS: Record<NotificationModule, string> = {
  transactions: 'Transactions',
  budgets: 'Budgets',
  goals: 'Goals',
  investments: 'Investments',
  trading: 'Trading',
  emi: 'EMI',
  bills: 'Bills',
  subscriptions: 'Subscriptions',
  calendar: 'Calendar',
  ai: 'AI Insights',
  automation: 'Automation',
  security: 'Security',
  lending: 'Lending',
  reports: 'Reports',
  dashboard: 'Dashboard',
};

const PRIORITY_TONES: Record<Exclude<NotificationPriority, 'urgent'>, 'critical' | 'high' | 'medium' | 'low'> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export function normalizeNotificationPriority(priority: NotificationPriority): 'critical' | 'high' | 'medium' | 'low' {
  if (priority === 'urgent') return 'critical';
  return PRIORITY_TONES[priority];
}

export function getNotificationPriorityLabel(priority: NotificationPriority): string {
  const normalized = normalizeNotificationPriority(priority);
  return normalized === 'critical' ? 'Critical' : normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getNotificationPriorityTone(priority: NotificationPriority): 'critical' | 'high' | 'medium' | 'low' {
  return normalizeNotificationPriority(priority);
}

export function getPriorityClasses(priority: NotificationPriority): { ring: string; bg: string; badge: string; text: string } {
  const tone = normalizeNotificationPriority(priority);

  switch (tone) {
    case 'critical':
      return {
        ring: 'ring-red-500/20',
        bg: 'bg-[rgba(239,68,68,0.10)] border-red-500/20',
        badge: 'bg-red-500/15 text-red-300 border border-red-500/20',
        text: 'text-red-300',
      };
    case 'high':
      return {
        ring: 'ring-orange-500/20',
        bg: 'bg-[rgba(249,115,22,0.10)] border-orange-500/20',
        badge: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
        text: 'text-orange-300',
      };
    case 'medium':
      return {
        ring: 'ring-[rgba(126,231,199,0.20)]',
        bg: 'bg-[rgba(126,231,199,0.08)] border-[rgba(126,231,199,0.18)]',
        badge: 'bg-[rgba(126,231,199,0.12)] text-[var(--accent-mint)] border border-[rgba(126,231,199,0.20)]',
        text: 'text-[var(--accent-mint)]',
      };
    default:
      return {
        ring: 'ring-white/10',
        bg: 'bg-white/3 border-white/8',
        badge: 'bg-white/5 text-secondary border border-border',
        text: 'text-secondary',
      };
  }
}

export function getNotificationModuleLabel(module?: NotificationModule | string): string {
  if (!module) return 'General';
  if (module in NOTIFICATION_MODULE_LABELS) {
    return NOTIFICATION_MODULE_LABELS[module as NotificationModule];
  }
  return module
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getNotificationLifecycleState(notification: Pick<NotificationModel, 'isArchived' | 'isDismissed' | 'isPinned' | 'isRead'>): NotificationLifecycleState {
  if (notification.isArchived) return 'archived';
  if (notification.isDismissed) return 'dismissed';
  if (!notification.isRead) return 'unread';
  if (notification.isPinned) return 'pinned';
  return 'read';
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'emi_upcoming':
    case 'emi_reminder':
      return 'EMI reminder';
    case 'emi_overdue':
      return 'EMI overdue';
    case 'debt_due':
    case 'bill_due':
      return 'Due reminder';
    case 'debt_overdue':
      return 'Overdue';
    case 'budget_overspend':
    case 'budget_alert':
      return 'Budget alert';
    case 'low_balance':
      return 'Low balance';
    case 'recurring_reminder':
      return 'Recurring alert';
    case 'bill_reminder':
      return 'Bill reminder';
    case 'transaction_alert':
      return 'Transaction alert';
    case 'security':
    case 'security_alert':
      return 'Security';
    case 'goal_update':
      return 'Goal update';
    case 'investment_change':
      return 'Investment update';
    case 'trading_pl_alert':
      return 'Trading alert';
    case 'subscription_due':
      return 'Subscription alert';
    case 'backup_alert':
      return 'Backup alert';
    case 'ai_recommendation':
      return 'AI recommendation';
    case 'automation_update':
      return 'Automation update';
    case 'calendar_event':
      return 'Calendar event';
    case 'report_ready':
      return 'Report ready';
    case 'dashboard_digest':
      return 'Dashboard digest';
    case 'lending_update':
      return 'Lending update';
    default:
      return 'Notification';
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'emi_upcoming':
    case 'emi_overdue':
    case 'debt_due':
    case 'debt_overdue':
      return '💳';
    case 'budget_overspend':
      return '📊';
    case 'low_balance':
      return '⚠️';
    case 'recurring_reminder':
      return '🔄';
    case 'bill_reminder':
      return '📄';
    case 'transaction_alert':
      return '💰';
    default:
      return '🔔';
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'emi_overdue':
    case 'debt_overdue':
    case 'budget_overspend':
    case 'low_balance':
    case 'security':
    case 'security_alert':
      return 'red';
    case 'emi_upcoming':
    case 'debt_due':
    case 'bill_reminder':
    case 'bill_due':
    case 'subscription_due':
      return 'amber';
    case 'recurring_reminder':
      return 'blue';
    case 'transaction_alert':
    case 'goal_update':
    case 'investment_change':
    case 'ai_recommendation':
    case 'backup_alert':
    case 'calendar_event':
    case 'report_ready':
    case 'dashboard_digest':
    case 'lending_update':
      return 'green';
    default:
      return 'gray';
  }
}

export function getNotificationGroupKey(notification: Pick<NotificationModel, 'groupKey' | 'module' | 'createdAt' | 'type'>): string {
  if (notification.groupKey) return notification.groupKey;
  const dateKey = new Date(notification.createdAt).toISOString().slice(0, 10);
  return `${notification.module || notification.type}:${dateKey}`;
}

export function getNotificationGroupLabel(notification: Pick<NotificationModel, 'groupLabel' | 'module' | 'type'>, count = 1): string {
  if (notification.groupLabel) return count > 1 ? `${count} ${notification.groupLabel}` : notification.groupLabel;

  const moduleLabel = getNotificationModuleLabel(notification.module);
  const typeLabel = getNotificationTypeLabel(notification.type).toLowerCase();

  if (count > 1) {
    if (notification.type === 'bill_reminder' || notification.type === 'bill_due' || notification.type === 'subscription_due' || notification.type === 'emi_reminder' || notification.type === 'emi_upcoming') {
      return `${count} ${moduleLabel.toLowerCase()} due this week`;
    }
    return `${count} ${moduleLabel.toLowerCase()} updates`;
  }

  return `${moduleLabel} ${typeLabel}`;
}

export function getActivityFeedTone(priority: NotificationPriority): 'critical' | 'high' | 'medium' | 'low' {
  return getNotificationPriorityTone(priority);
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}