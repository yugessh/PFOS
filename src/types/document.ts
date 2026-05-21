export type DocumentCategory = 'insurance' | 'bills' | 'warranty' | 'loans' | 'tax' | 'subscription' | 'other';
export type DocumentStatus = 'active' | 'expired' | 'upcoming' | 'completed';
export type ReminderType = 'before_7_days' | 'before_3_days' | 'before_1_day' | 'on_due_date';

export interface DocumentAttachment {
  id: string;
  filename: string;
  url: string;
  type: 'pdf' | 'image' | 'document' | 'receipt';
  uploadedAt: Date;
  size: number;
}

export interface DocumentReminder {
  type: ReminderType;
  enabled: boolean;
  notified?: boolean;
  notifiedAt?: Date;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  provider?: string;
  amount?: number;
  renewalDate?: Date;
  dueDate?: Date;
  status: DocumentStatus;
  attachments: DocumentAttachment[];
  notes?: string;
  reminders: DocumentReminder[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Dashboard summary
export interface DocumentVaultSummary {
  totalDocuments: number;
  upcomingRenewals: number;
  monthlyBills: number;
  totalPolicies: number;
  dueThisWeek: number;
  expiredCount: number;
}
