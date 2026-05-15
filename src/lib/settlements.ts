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

export function calculateSettlementSummary(settlements: SettlementModel[]): SettlementSummary {
  return {
    totalPending: settlements
      .filter(s => !s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0),
    totalPaid: settlements
      .filter(s => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0),
    numberOfPeople: new Set(settlements.map(s => s.personName)).size,
    pendingCount: settlements.filter(s => !s.isPaid).length,
    paidCount: settlements.filter(s => s.isPaid).length,
  };
}
