/**
 * Asset & Liability Register core types and helpers
 */

export type AssetCategory =
  | 'bank'
  | 'cash'
  | 'fixed_deposit'
  | 'gold'
  | 'silver'
  | 'mutual_fund'
  | 'stock'
  | 'crypto'
  | 'property'
  | 'vehicle'
  | 'business'
  | 'custom';

export interface AssetRecord {
  id?: string;
  userId?: string;
  name: string;
  category: AssetCategory;
  currentValue: number;
  purchaseValue?: number;
  purchaseDate?: Date | null;
  ownership?: { ownerId: string; percent: number }[];
  notes?: string;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LiabilityRecord {
  id?: string;
  userId?: string;
  name: string;
  outstandingAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  dueDate?: Date | null;
  status?: 'active' | 'closed' | 'default';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function aggregateNetWorth(assets: AssetRecord[], liabilities: LiabilityRecord[]) {
  const totalAssets = assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  return { totalAssets, totalLiabilities, netWorth };
}

export function allocationBreakdown(assets: AssetRecord[]) {
  const totals = assets.reduce((map: Record<string, number>, a) => {
    map[a.category] = (map[a.category] || 0) + (a.currentValue || 0);
    return map;
  }, {} as Record<string, number>);
  const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
  const breakdown = Object.keys(totals).map((k) => ({ category: k, value: totals[k], percent: Math.round((totals[k] / total) * 10000) / 100 }));
  return { totals, breakdown };
}
