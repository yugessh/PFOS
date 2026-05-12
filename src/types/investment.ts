export interface Investment {
  id: string;
  name: string;
  type: 'mutual-fund' | 'stock' | 'crypto' | 'fixed-deposit';
  currentValue: number;
  investedAmount: number;
  returns: number;
  returnPercentage: number;
  date: Date;
}
