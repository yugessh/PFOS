// Account Types
export interface Account {
  id: string;
  name: string;
  type: 'savings' | 'checking' | 'credit' | 'investment';
  balance: number;
  icon: string;
  color?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: Date;
  account: string;
}

// Goal Types
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  icon?: string;
}

// EMI Types
export interface EMI {
  id: string;
  name: string;
  principalAmount: number;
  monthlyPayment: number;
  remainingAmount: number;
  rateOfInterest: number;
  startDate: Date;
  endDate: Date;
  monthsRemaining: number;
}

// Investment Types
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

// Reminder Types
export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  category: string;
}
