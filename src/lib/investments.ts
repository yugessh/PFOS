export interface InvestmentModel {
  id: string;
  userId: string;
  name: string;
  type: 'sip' | 'stocks' | 'mutual_funds' | 'crypto' | 'gold' | 'fd';
  amountInvested: number;
  currentValue: number;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function calculateInvestmentReturn(investment: InvestmentModel) {
  const gain = investment.currentValue - investment.amountInvested;
  const gainPercent = (gain / investment.amountInvested) * 100;
  return { gain, gainPercent };
}

export function getInvestmentTypeLabel(type: InvestmentModel['type']): string {
  const labels: Record<InvestmentModel['type'], string> = {
    sip: 'SIP',
    stocks: 'Stocks',
    mutual_funds: 'Mutual Funds',
    crypto: 'Crypto',
    gold: 'Gold',
    fd: 'Fixed Deposit',
  };
  return labels[type];
}

export interface InvestmentTransaction {
  id: string;
  userId: string;
  investmentId: string;
  transactionType: 'BUY' | 'SELL';
  assetName: string;
  assetType: InvestmentModel['type'];
  quantity: number;
  price: number;
  amount: number;
  linkedAccount?: string;
  fees?: number;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function getInvestmentTypeColor(type: InvestmentModel['type']): string {
  const colors: Record<InvestmentModel['type'], string> = {
    sip: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    stocks: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    mutual_funds: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    crypto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    fd: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  return colors[type];
}
