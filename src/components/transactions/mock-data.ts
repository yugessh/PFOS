/**
 * Mock data for transaction categories and accounts
 * Realistic data inspired by common finance app categories
 */

import { Category, Account, TransactionType } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: '🏥', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Education', icon: '📚', color: '#98D8C8', type: 'expense' },
  { id: '8', name: 'Groceries', icon: '🛒', color: '#F7DC6F', type: 'expense' },
  { id: '9', name: 'Travel', icon: '✈️', color: '#85C1E9', type: 'expense' },
  { id: '10', name: 'Personal Care', icon: '💇', color: '#F1948A', type: 'expense' },
  { id: '11', name: 'Home', icon: '🏠', color: '#82E0AA', type: 'expense' },
  { id: '12', name: 'Other', icon: '📦', color: '#BDC3C7', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: '13', name: 'Salary', icon: '💰', color: '#2ECC71', type: 'income' },
  { id: '14', name: 'Freelance', icon: '💻', color: '#3498DB', type: 'income' },
  { id: '15', name: 'Investments', icon: '📈', color: '#9B59B6', type: 'income' },
  { id: '16', name: 'Gifts', icon: '🎁', color: '#E91E63', type: 'income' },
  { id: '17', name: 'Refunds', icon: '↩️', color: '#FF9800', type: 'income' },
  { id: '18', name: 'Other Income', icon: '💵', color: '#607D8B', type: 'income' },
];

export const ACCOUNTS: Account[] = [
  { id: '1', name: 'HDFC Savings', type: 'Bank Account', balance: 125000, icon: '🏦', color: '#4A90E2' },
  { id: '2', name: 'ICICI Current', type: 'Bank Account', balance: 45000, icon: '🏦', color: '#50E3C2' },
  { id: '3', name: 'Cash', type: 'Cash', balance: 5000, icon: '💵', color: '#F5A623' },
  { id: '4', name: 'Credit Card', type: 'Credit Card', balance: -25000, icon: '💳', color: '#E91E63' },
  { id: '5', name: 'Paytm Wallet', type: 'Digital Wallet', balance: 3200, icon: '📱', color: '#00BFA5' },
  { id: '6', name: 'Google Pay', type: 'Digital Wallet', balance: 1500, icon: '📱', color: '#4285F4' },
];

export const getCategoriesByType = (type: TransactionType): Category[] => {
  switch (type) {
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'income':
      return INCOME_CATEGORIES;
    case 'transfer':
      return [];
    default:
      return [];
  }
};

export const getCategoryById = (id: string): Category | undefined => {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(cat => cat.id === id);
};

export const getAccountById = (id: string): Account | undefined => {
  return ACCOUNTS.find(acc => acc.id === id);
};
