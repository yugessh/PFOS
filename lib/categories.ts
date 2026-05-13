export type CategoryType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentId?: string | null;
  color?: string; // hex or css color
  icon?: string; // emoji or icon name
}

// Centralized realistic mock categories for fast prototyping
export const mockCategories: Category[] = [
  // Expense
  { id: 'e_food', name: 'Food', type: 'expense', color: '#FF7043', icon: '🍔' },
  { id: 'e_groceries', name: 'Groceries', type: 'expense', parentId: 'e_food', color: '#FF8A65', icon: '🛒' },
  { id: 'e_transport', name: 'Transport', type: 'expense', color: '#29B6F6', icon: '🚌' },
  { id: 'e_fuel', name: 'Fuel', type: 'expense', parentId: 'e_transport', color: '#4FC3F7', icon: '⛽' },
  { id: 'e_shopping', name: 'Shopping', type: 'expense', color: '#AB47BC', icon: '🛍️' },
  { id: 'e_bills', name: 'Bills', type: 'expense', color: '#8D6E63', icon: '💡' },

  // Income
  { id: 'i_salary', name: 'Salary', type: 'income', color: '#66BB6A', icon: '💼' },
  { id: 'i_freelance', name: 'Freelance', type: 'income', color: '#9CCC65', icon: '🧑‍💻' },
  { id: 'i_trading', name: 'Trading Profit', type: 'income', color: '#7E57C2', icon: '📈' },

  // Transfer
  { id: 't_internal', name: 'Internal Transfer', type: 'transfer', color: '#90A4AE', icon: '🔁' },
  { id: 't_external', name: 'External Transfer', type: 'transfer', color: '#78909C', icon: '🏦' },
];

export const getCategoriesByType = (type: CategoryType) =>
  mockCategories.filter((c) => c.type === type);

export const findCategory = (id: string) => mockCategories.find((c) => c.id === id) || null;
