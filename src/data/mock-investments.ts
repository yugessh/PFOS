import type { Investment } from '../types';

export const investments: Investment[] = [
  {
    id: '1',
    name: 'Mutual Fund A',
    type: 'mutual-fund',
    currentValue: 125000,
    investedAmount: 100000,
    returns: 25000,
    returnPercentage: 25,
    date: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Index Fund',
    type: 'mutual-fund',
    currentValue: 187000,
    investedAmount: 150000,
    returns: 37000,
    returnPercentage: 24.67,
    date: new Date('2022-06-01'),
  },
  {
    id: '3',
    name: 'Tech Stock',
    type: 'stock',
    currentValue: 95000,
    investedAmount: 85000,
    returns: 10000,
    returnPercentage: 11.76,
    date: new Date('2023-09-10'),
  },
  {
    id: '4',
    name: 'Fixed Deposit',
    type: 'fixed-deposit',
    currentValue: 113000,
    investedAmount: 100000,
    returns: 13000,
    returnPercentage: 13,
    date: new Date('2023-03-01'),
  },
];
