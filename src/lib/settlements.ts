export type SettlementType = 'lent' | 'borrowed' | 'custom';
export type SettlementStatus = 'pending' | 'partial' | 'completed' | 'overdue';

export interface SettlementPayment {
  id: string;
  amount: number;
  date: Date;
  notes?: string;
  accountId?: string;
  transactionType: 'income' | 'expense';
  transactionId?: string;
  createdAt: Date;
}

export interface SettlementModel {
  id: string;
  userId: string;
  personName: string;
  type: SettlementType;
  amount: number;
  remainingAmount: number;
  status: SettlementStatus;
  description?: string;
  linkedAccount?: string;
  dueDate?: Date | null;
  phone?: string;
  notes?: string;
  payments?: SettlementPayment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  lastActivityAt?: Date;
}

export interface SettlementSummary {
  totalLent: number;
  totalBorrowed: number;
  pendingAmount: number;
  overdueAmount: number;
  pendingCount: number;
  overdueCount: number;
  activeCount: number;
}

export function getSettlementStatus(settlement: Partial<SettlementModel>): SettlementStatus {
  const remaining = settlement.remainingAmount ?? settlement.amount ?? 0;
  const dueDate = settlement.dueDate ? new Date(settlement.dueDate) : null;
  const now = new Date();

  if (remaining <= 0) {
    return 'completed';
  }

  if (dueDate && dueDate < now) {
    return 'overdue';
  }

  if (remaining < (settlement.amount ?? 0)) {
    return 'partial';
  }

  return 'pending';
}

export function calculateSettlementSummary(settlements: unknown): SettlementSummary {
  const safeSettlements = Array.isArray(settlements) ? settlements : [];

  if (process.env.NODE_ENV === 'development') {
    console.log('settlements type:', typeof settlements, settlements);
  }

  return {
    totalLent: safeSettlements
      .filter((s) => (s as SettlementModel).type === 'lent')
      .reduce((sum, s) => sum + ((s as SettlementModel).remainingAmount ?? 0), 0),
    totalBorrowed: safeSettlements
      .filter((s) => (s as SettlementModel).type === 'borrowed')
      .reduce((sum, s) => sum + ((s as SettlementModel).remainingAmount ?? 0), 0),
    pendingAmount: safeSettlements
      .filter((s) => (s as SettlementModel).status === 'pending' || (s as SettlementModel).status === 'partial')
      .reduce((sum, s) => sum + ((s as SettlementModel).remainingAmount ?? 0), 0),
    overdueAmount: safeSettlements
      .filter((s) => (s as SettlementModel).status === 'overdue')
      .reduce((sum, s) => sum + ((s as SettlementModel).remainingAmount ?? 0), 0),
    pendingCount: safeSettlements.filter((s) => (s as SettlementModel).status === 'pending' || (s as SettlementModel).status === 'partial').length,
    overdueCount: safeSettlements.filter((s) => (s as SettlementModel).status === 'overdue').length,
    activeCount: safeSettlements.filter((s) => (s as SettlementModel).status !== 'completed').length,
  };
}
