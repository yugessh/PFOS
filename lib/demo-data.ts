import { Account, Transaction, SavingsGoal, EMI, Investment, Reminder } from './types';

export const accounts: Account[] = [
  { id: '1', name: 'Savings Account', type: 'savings', balance: 245000, icon: 'Wallet' },
  { id: '2', name: 'Checking Account', type: 'checking', balance: 85000, icon: 'CreditCard' },
  { id: '3', name: 'Investment Account', type: 'investment', balance: 520000, icon: 'TrendingUp' },
];

export const transactions: Transaction[] = [
  { id: '1', description: 'Salary', amount: 150000, type: 'income', category: 'Salary', date: new Date('2024-05-01'), account: '1' },
  { id: '2', description: 'Grocery Store', amount: 3500, type: 'expense', category: 'Food', date: new Date('2024-05-02'), account: '2' },
  { id: '3', description: 'Electric Bill', amount: 2100, type: 'expense', category: 'Utilities', date: new Date('2024-05-03'), account: '1' },
  { id: '4', description: 'Restaurant', amount: 1200, type: 'expense', category: 'Dining', date: new Date('2024-05-04'), account: '2' },
  { id: '5', description: 'Gas Station', amount: 1800, type: 'expense', category: 'Transportation', date: new Date('2024-05-05'), account: '2' },
  { id: '6', description: 'Online Shopping', amount: 4500, type: 'expense', category: 'Shopping', date: new Date('2024-05-06'), account: '1' },
  { id: '7', description: 'Netflix Subscription', amount: 499, type: 'expense', category: 'Entertainment', date: new Date('2024-05-07'), account: '1' },
  { id: '8', description: 'Coffee Shop', amount: 350, type: 'expense', category: 'Food', date: new Date('2024-05-08'), account: '2' },
  { id: '9', description: 'Internet Bill', amount: 1500, type: 'expense', category: 'Utilities', date: new Date('2024-05-09'), account: '1' },
  { id: '10', description: 'Bonus', amount: 25000, type: 'income', category: 'Salary', date: new Date('2024-05-10'), account: '1' },
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'Vacation Fund',
    targetAmount: 150000,
    currentAmount: 92000,
    deadline: new Date('2024-12-31'),
    category: 'Travel',
  },
  {
    id: '2',
    name: 'Emergency Fund',
    targetAmount: 500000,
    currentAmount: 245000,
    deadline: new Date('2025-12-31'),
    category: 'Emergency',
  },
  {
    id: '3',
    name: 'Car Down Payment',
    targetAmount: 300000,
    currentAmount: 128000,
    deadline: new Date('2025-06-30'),
    category: 'Vehicle',
  },
  {
    id: '4',
    name: 'Home Renovation',
    targetAmount: 400000,
    currentAmount: 156000,
    deadline: new Date('2026-03-31'),
    category: 'Home',
  },
];

export const emis: EMI[] = [
  {
    id: '1',
    name: 'Home Loan',
    principalAmount: 2500000,
    monthlyPayment: 45000,
    remainingAmount: 2100000,
    rateOfInterest: 7.5,
    startDate: new Date('2020-01-01'),
    endDate: new Date('2040-01-01'),
    monthsRemaining: 120,
  },
  {
    id: '2',
    name: 'Car Loan',
    principalAmount: 800000,
    monthlyPayment: 18000,
    remainingAmount: 350000,
    rateOfInterest: 9.0,
    startDate: new Date('2021-06-01'),
    endDate: new Date('2026-06-01'),
    monthsRemaining: 18,
  },
  {
    id: '3',
    name: 'Personal Loan',
    principalAmount: 200000,
    monthlyPayment: 12000,
    remainingAmount: 50000,
    rateOfInterest: 11.5,
    startDate: new Date('2022-01-01'),
    endDate: new Date('2024-12-01'),
    monthsRemaining: 5,
  },
];

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

export const reminders: Reminder[] = [
  {
    id: '1',
    title: 'EMI Payment Due',
    description: 'Home Loan EMI - ₹45,000',
    dueDate: new Date('2024-05-15'),
    completed: false,
    category: 'Payment',
  },
  {
    id: '2',
    title: 'Credit Card Bill Due',
    description: 'Pay credit card bill',
    dueDate: new Date('2024-05-20'),
    completed: false,
    category: 'Payment',
  },
  {
    id: '3',
    title: 'Insurance Premium',
    description: 'Health Insurance - ₹5,000',
    dueDate: new Date('2024-05-25'),
    completed: false,
    category: 'Payment',
  },
  {
    id: '4',
    title: 'Review Budget',
    description: 'Monthly budget review',
    dueDate: new Date('2024-05-30'),
    completed: false,
    category: 'Review',
  },
];

// Monthly spending data for charts
export const monthlySpending = [
  { month: 'Jan', spending: 28000, income: 150000 },
  { month: 'Feb', spending: 31000, income: 150000 },
  { month: 'Mar', spending: 25000, income: 150000 },
  { month: 'Apr', spending: 29000, income: 175000 },
  { month: 'May', spending: 26000, income: 150000 },
];

// Expense breakdown data
export const expenseBreakdown = [
  { category: 'Food', value: 12000, percentage: 25 },
  { category: 'Transportation', value: 8000, percentage: 17 },
  { category: 'Utilities', value: 5000, percentage: 11 },
  { category: 'Shopping', value: 10000, percentage: 21 },
  { category: 'Entertainment', value: 7000, percentage: 15 },
  { category: 'Others', value: 5000, percentage: 11 },
];
