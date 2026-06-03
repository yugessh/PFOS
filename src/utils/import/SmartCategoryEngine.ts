/**
 * SmartCategoryEngine for PFOS Data Import Hub
 * Auto-detects transaction types and categorizes descriptions using keyword patterns.
 */

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';

// Mapping definitions for categories
const CATEGORY_KEYWORDS: Record<string, { category: string; icon: string }> = {
  // Food & Dining
  swiggy: { category: 'Food & Dining', icon: '🍔' },
  zomato: { category: 'Food & Dining', icon: '🍔' },
  starbucks: { category: 'Food & Dining', icon: '🍔' },
  mcdonald: { category: 'Food & Dining', icon: '🍔' },
  pizza: { category: 'Food & Dining', icon: '🍔' },
  burger: { category: 'Food & Dining', icon: '🍔' },
  restaurant: { category: 'Food & Dining', icon: '🍔' },
  cafe: { category: 'Food & Dining', icon: '🍔' },
  dining: { category: 'Food & Dining', icon: '🍔' },
  food: { category: 'Food & Dining', icon: '🍔' },
  eats: { category: 'Food & Dining', icon: '🍔' },

  // Transportation & Travel
  uber: { category: 'Transportation', icon: '🛵' },
  ola: { category: 'Transportation', icon: '🛵' },
  rapido: { category: 'Transportation', icon: '🛵' },
  petrol: { category: 'Transportation', icon: '🛵' },
  fuel: { category: 'Transportation', icon: '🛵' },
  hpcl: { category: 'Transportation', icon: '🛵' },
  bpcl: { category: 'Transportation', icon: '🛵' },
  shell: { category: 'Transportation', icon: '🛵' },
  flight: { category: 'Travel', icon: '✈️' },
  airways: { category: 'Travel', icon: '✈️' },
  irctc: { category: 'Transportation', icon: '🛵' },
  railway: { category: 'Transportation', icon: '🛵' },
  metro: { category: 'Transportation', icon: '🛵' },
  travel: { category: 'Travel', icon: '✈️' },
  makemytrip: { category: 'Travel', icon: '✈️' },
  yatra: { category: 'Travel', icon: '✈️' },

  // Shopping
  amazon: { category: 'Shopping', icon: '🛍️' },
  flipkart: { category: 'Shopping', icon: '🛍️' },
  myntra: { category: 'Shopping', icon: '🛍️' },
  zara: { category: 'Shopping', icon: '🛍️' },
  hm: { category: 'Shopping', icon: '🛍️' },
  ajio: { category: 'Shopping', icon: '🛍️' },
  nykaa: { category: 'Shopping', icon: '🛍️' },
  shopping: { category: 'Shopping', icon: '🛍️' },
  retail: { category: 'Shopping', icon: '🛍️' },
  mall: { category: 'Shopping', icon: '🛍️' },

  // Groceries
  grocery: { category: 'Groceries', icon: '🛒' },
  groceries: { category: 'Groceries', icon: '🛒' },
  dmart: { category: 'Groceries', icon: '🛒' },
  bigbasket: { category: 'Groceries', icon: '🛒' },
  blinkit: { category: 'Groceries', icon: '🛒' },
  zepto: { category: 'Groceries', icon: '🛒' },
  instamart: { category: 'Groceries', icon: '🛒' },
  milk: { category: 'Groceries', icon: '🛒' },
  supermarket: { category: 'Groceries', icon: '🛒' },

  // Bills & Utilities
  electricity: { category: 'Bills & Utilities', icon: '💡' },
  power: { category: 'Bills & Utilities', icon: '💡' },
  water: { category: 'Bills & Utilities', icon: '💡' },
  jio: { category: 'Bills & Utilities', icon: '💡' },
  airtel: { category: 'Bills & Utilities', icon: '💡' },
  vodafone: { category: 'Bills & Utilities', icon: '💡' },
  broadband: { category: 'Bills & Utilities', icon: '💡' },
  insurance: { category: 'Bills & Utilities', icon: '💡' },
  lic: { category: 'Bills & Utilities', icon: '💡' },
  recharge: { category: 'Bills & Utilities', icon: '💡' },
  billpay: { category: 'Bills & Utilities', icon: '💡' },
  gas: { category: 'Bills & Utilities', icon: '💡' },

  // Entertainment
  netflix: { category: 'Entertainment', icon: '🎬' },
  spotify: { category: 'Entertainment', icon: '🎬' },
  prime: { category: 'Entertainment', icon: '🎬' },
  youtube: { category: 'Entertainment', icon: '🎬' },
  hotstar: { category: 'Entertainment', icon: '🎬' },
  cinema: { category: 'Entertainment', icon: '🎬' },
  movie: { category: 'Entertainment', icon: '🎬' },
  bookmyshow: { category: 'Entertainment', icon: '🎬' },
  steam: { category: 'Entertainment', icon: '🎬' },
  playstation: { category: 'Entertainment', icon: '🎬' },

  // Income / Salary
  salary: { category: 'Salary', icon: '💰' },
  payroll: { category: 'Salary', icon: '💰' },
  interest: { category: 'Other Income', icon: '💵' },
  dividend: { category: 'Investments', icon: '📈' },
  refund: { category: 'Refunds', icon: '↩️' },
  cashback: { category: 'Refunds', icon: '↩️' },

  // Investments
  zerodha: { category: 'Investments', icon: '📈' },
  groww: { category: 'Investments', icon: '📈' },
  mutual: { category: 'Investments', icon: '📈' },
  sip: { category: 'Investments', icon: '📈' },
  crypto: { category: 'Investments', icon: '📈' },
  binance: { category: 'Investments', icon: '📈' },
  wazirx: { category: 'Investments', icon: '📈' },
  coindcx: { category: 'Investments', icon: '📈' },
  shares: { category: 'Investments', icon: '📈' },
  stocks: { category: 'Investments', icon: '📈' },

  // Healthcare
  hospital: { category: 'Healthcare', icon: '🏥' },
  pharmacy: { category: 'Healthcare', icon: '🏥' },
  chemist: { category: 'Healthcare', icon: '🏥' },
  medical: { category: 'Healthcare', icon: '🏥' },
  clinic: { category: 'Healthcare', icon: '🏥' },
  doctor: { category: 'Healthcare', icon: '🏥' },

  // Education
  school: { category: 'Education', icon: '📚' },
  college: { category: 'Education', icon: '📚' },
  fees: { category: 'Education', icon: '📚' },
  udemy: { category: 'Education', icon: '📚' },
  coursera: { category: 'Education', icon: '📚' },
  book: { category: 'Education', icon: '📚' },
};

/**
 * Detect transaction type from narration/description and debit/credit amounts
 */
export function detectTransactionType(
  description: string,
  debitAmount: number,
  creditAmount: number
): TransactionType {
  const descLower = description.toLowerCase();

  // 1. Transfers
  if (
    descLower.includes('transfer') ||
    descLower.includes('self transfer') ||
    descLower.includes('sweep') ||
    descLower.includes('tfr') ||
    descLower.includes('to a/c') ||
    descLower.includes('from a/c') ||
    (descLower.includes('upi') && descLower.includes('self'))
  ) {
    return 'transfer';
  }

  // 2. Investments
  if (
    descLower.includes('zerodha') ||
    descLower.includes('groww') ||
    descLower.includes('mutual fund') ||
    descLower.includes('sip') ||
    descLower.includes('crypto') ||
    descLower.includes('binance') ||
    descLower.includes('wazirx') ||
    descLower.includes('coindcx') ||
    descLower.includes('investment') ||
    descLower.includes('smallcase') ||
    descLower.includes('nps') ||
    descLower.includes('ppf')
  ) {
    return 'investment';
  }

  // 3. Credit vs Debit based default
  if (creditAmount > 0 && debitAmount === 0) {
    return 'income';
  }

  // Common salary indicator
  if (descLower.includes('salary') || descLower.includes('payroll') || descLower.includes('direct dep')) {
    return 'income';
  }

  return 'expense';
}

/**
 * Categorize a transaction based on its description and type
 */
export function autoCategorize(
  description: string,
  type: TransactionType
): { category: string; icon: string } {
  const descLower = description.toLowerCase().trim();

  // If investment, default to Investments category
  if (type === 'investment') {
    return { category: 'Investments', icon: '📈' };
  }

  // If transfer, default to Other
  if (type === 'transfer') {
    return { category: 'Other', icon: '📦' };
  }

  // Match keyword patterns
  for (const [key, value] of Object.entries(CATEGORY_KEYWORDS)) {
    if (descLower.includes(key)) {
      // Validate that type matches category (e.g. Salary category is for Income)
      if (value.category === 'Salary' || value.category === 'Other Income') {
        if (type !== 'income') continue;
      }
      return value;
    }
  }

  // Defaults based on type
  if (type === 'income') {
    return { category: 'Other Income', icon: '💵' };
  }

  return { category: 'Other', icon: '📦' };
}
