export interface SettlementModel {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  isPaid: boolean;
  paidDate?: Date | null;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface SettlementSummary {
  totalPending: number;
  totalPaid: number;
  numberOfPeople: number;
  pendingCount: number;
  paidCount: number;
}

export function calculateSettlementSummary(settlements: unknown): SettlementSummary {
  const safeSettlements = Array.isArray(settlements) ? settlements : [];

  if (process.env.NODE_ENV === 'development') {
    console.log('settlements type:', typeof settlements, settlements);
  }

  return {
    totalPending: safeSettlements
      .filter((s) => !s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0),
    totalPaid: safeSettlements
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0),
    numberOfPeople: new Set(safeSettlements.map((s) => s.personName)).size,
    pendingCount: safeSettlements.filter((s) => !s.isPaid).length,
    paidCount: safeSettlements.filter((s) => s.isPaid).length,
  };
}
