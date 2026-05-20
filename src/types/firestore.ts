/**
 * Firestore model interfaces for PFOS application
 * Defines the structure of documents in each collection
 */

// Base interface for all Firestore documents
export interface BaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// User collection
export interface User extends BaseDocument {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  currency: string; // Default currency for the user
  timezone: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  transactions: boolean;
  goals: boolean;
  reminders: boolean;
  emi: boolean;
}

export interface PrivacyPreferences {
  shareAnalytics: boolean;
  shareData: boolean;
  publicProfile: boolean;
}

// Account collection
export interface Account extends BaseDocument {
  userId: string;
  name: string;
  accountName?: string;
  accountType: AccountType;
  type?: AccountType;
  currentBalance: number;
  balance?: number;
  currency: string;
  color: string;
  icon: string;
  monthlyInflow: number;
  monthlyOutflow: number;
  lastTransaction: string | null;
  isActive: boolean;
  isDefault: boolean;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  description?: string;
  lastUpdated?: Date;
}

export type AccountType = 
  | 'bank_account'
  | 'cash'
  | 'upi_wallet'
  | 'credit_card'
  | 'savings_account'
  | 'investment_account'
  | 'crypto_wallet'
  | 'custom_account'
  | 'savings'
  | 'checking'
  | 'investment'
  | 'loan'
  | 'wallet'
  | 'debit_card'
  | 'digital_wallet'
  | 'other';

// Transaction collection
export interface Transaction extends BaseDocument {
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  date: Date;
  tags?: string[];
  location?: string;
  receipt?: string; // URL to receipt image
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  metadata?: Record<string, any>;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Recurring transactions collection
export interface RecurringTransaction extends BaseDocument {
  userId: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string;
  frequency: RecurringFrequency;
  interval: number;
  startDate: Date;
  nextRunDate: Date;
  lastRunDate?: Date;
  endDate?: Date;
  notes?: string;
  currency: string;
  reminderDaysBefore: number;
  isActive: boolean;
}

// Category collection
export interface Category extends BaseDocument {
  userId: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  parentId?: string; // For subcategories
  isDefault: boolean;
  isActive: boolean;
  budget?: number; // Monthly budget for this category
}

// Budget collection
export interface Budget extends BaseDocument {
  userId: string;
  monthKey: string; // YYYY-MM
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  monthlyLimit: number;
  currency: string;
  isActive: boolean;
}

// Investment collection
export interface Investment extends BaseDocument {
  userId: string;
  investmentType: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  returns: number;
  returnsPercentage: number;
  purchaseDate: Date;
  currentValueDate: Date;
  currency: string;
  isActive: boolean;
  description?: string;
  metadata?: Record<string, any>;
}

export type InvestmentType = 
  | 'stocks'
  | 'mutual_funds'
  | 'bonds'
  | 'real_estate'
  | 'fixed_deposit'
  | 'recurring_deposit'
  | 'ppf'
  | 'epf'
  | 'nps'
  | 'crypto'
  | 'gold'
  | 'other';

// Goals collection
export interface Goal extends BaseDocument {
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: GoalStatus;
  priority: GoalPriority;
  category: string;
  isShared: boolean;
  sharedWith?: string[]; // Array of user IDs
  milestones?: GoalMilestone[];
  metadata?: Record<string, any>;
}

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface GoalMilestone {
  title: string;
  targetAmount: number;
  achievedAmount: number;
  achievedDate?: Date;
  isCompleted: boolean;
}

// EMI collection
export interface EMI extends BaseDocument {
  userId: string;
  loanName: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  startDate: Date;
  endDate: Date;
  remainingAmount: number;
  paidAmount: number;
  nextDueDate: Date;
  isActive: boolean;
  lenderName?: string;
  loanType: EMIType;
  description?: string;
  metadata?: Record<string, any>;
}

export type EMIType = 
  | 'home_loan'
  | 'car_loan'
  | 'personal_loan'
  | 'education_loan'
  | 'business_loan'
  | 'credit_card'
  | 'other';

// Reminders collection
export interface Reminder extends BaseDocument {
  userId: string;
  title: string;
  description?: string;
  reminderType: ReminderType;
  reminderDate: Date;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  priority: ReminderPriority;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export type ReminderType = 
  | 'bill_payment'
  | 'emi_payment'
  | 'investment_maturity'
  | 'goal_deadline'
  | 'document_renewal'
  | 'appointment'
  | 'other';

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

// Settlements collection
export interface Settlement extends BaseDocument {
  userId: string;
  settlementType: SettlementType;
  title: string;
  description?: string;
  settlementDate: Date;
  settlementAmount: number;
  currency: string;
  status: SettlementStatus;
  parties: SettlementParty[];
  documents?: string[]; // URLs to settlement documents
  metadata?: Record<string, any>;
}

export type SettlementType = 'legal' | 'insurance' | 'property' | 'business' | 'personal' | 'other';
export type SettlementStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface SettlementParty {
  name: string;
  type: 'individual' | 'organization';
  contact?: string;
  role: 'claimant' | 'defendant' | 'witness' | 'other';
}

// Policies collection
export interface Policy extends BaseDocument {
  userId: string;
  policyType: PolicyType;
  policyNumber: string;
  providerName: string;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  nextPremiumDate: Date;
  beneficiaries?: string[];
  documents?: string[]; // URLs to policy documents
  description?: string;
  metadata?: Record<string, any>;
}

export type PolicyType = 
  | 'life_insurance'
  | 'health_insurance'
  | 'car_insurance'
  | 'home_insurance'
  | 'travel_insurance'
  | 'term_insurance'
  | 'endowment'
  | 'other';

export type PremiumFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

// Query interfaces
export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: {
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
    value: any;
  }[];
  startAfter?: any;
  startAt?: any;
}

export interface WhereClause {
  field: string;
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
  value: any;
}

export interface PaginationOptions {
  pageSize: number;
  startAfter?: any;
}

// Service response interfaces
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ListResponse<T> {
  data: T[];
  hasMore: boolean;
  lastDocument?: any;
  totalCount?: number;
}
