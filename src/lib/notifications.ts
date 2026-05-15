export type NotificationType =
  | 'emi_upcoming'
  | 'emi_overdue'
  | 'budget_overspend'
  | 'low_balance'
  | 'recurring_reminder'
  | 'bill_reminder'
  | 'transaction_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationModel {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
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

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'emi_upcoming':
    case 'emi_overdue':
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
    case 'budget_overspend':
    case 'low_balance':
      return 'red';
    case 'emi_upcoming':
    case 'bill_reminder':
      return 'amber';
    case 'recurring_reminder':
      return 'blue';
    case 'transaction_alert':
      return 'green';
    default:
      return 'gray';
  }
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}