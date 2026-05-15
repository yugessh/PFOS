/**
 * Firestore collection names for PFOS application
 * Centralized collection constants to avoid typos and maintain consistency
 */

export const COLLECTIONS = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  RECURRING_TRANSACTIONS: 'recurringTransactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
  INVESTMENTS: 'investments',
  GOALS: 'goals',
  EMI: 'emi',
  REMINDERS: 'reminders',
  SETTLEMENTS: 'settlements',
  POLICIES: 'policies',
  NOTIFICATIONS: 'notifications',
  TRADING_JOURNAL: 'tradingJournal',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/**
 * Subcollection paths for nested data structures
 */
export const SUBCOLLECTIONS = {
  // User subcollections
  USER_ACCOUNTS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.ACCOUNTS}`,
  USER_TRANSACTIONS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.TRANSACTIONS}`,
  USER_RECURRING_TRANSACTIONS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.RECURRING_TRANSACTIONS}`,
  USER_CATEGORIES: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATEGORIES}`,
  USER_BUDGETS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.BUDGETS}`,
  USER_INVESTMENTS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.INVESTMENTS}`,
  USER_GOALS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.GOALS}`,
  USER_EMIS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.EMI}`,
  USER_EMI_PAYMENTS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.EMI}_payments`,
  USER_REMINDERS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.REMINDERS}`,
  USER_SETTLEMENTS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SETTLEMENTS}`,
  USER_POLICIES: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.POLICIES}`,
  USER_NOTIFICATIONS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.NOTIFICATIONS}`,
  USER_TRADING_JOURNAL: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.TRADING_JOURNAL}`,
  USER_SMART_ALERTS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/smartAlerts`,
  USER_NOTIFICATION_SETTINGS: (userId: string) => `${COLLECTIONS.USERS}/${userId}/notificationSettings`,
  
  // Account subcollections
  ACCOUNT_TRANSACTIONS: (userId: string, accountId: string) => 
    `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.ACCOUNTS}/${accountId}/${COLLECTIONS.TRANSACTIONS}`,
} as const;

/**
 * Document ID patterns for consistent ID generation
 */
export const DOCUMENT_IDS = {
  // Auto-generated patterns
  AUTO: () => `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Specific patterns
  USER: (userId: string) => `user_${userId}`,
  ACCOUNT: (userId: string, accountType: string) => `account_${userId}_${accountType}_${Date.now()}`,
  TRANSACTION: (userId: string) => `txn_${userId}_${Date.now()}`,
  CATEGORY: (userId: string, name: string) => `cat_${userId}_${name.toLowerCase().replace(/\s+/g, '_')}`,
  GOAL: (userId: string, title: string) => `goal_${userId}_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
} as const;

/**
 * Field names for consistent querying and indexing
 */
export const FIELDS = {
  // Common fields
  ID: 'id',
  USER_ID: 'userId',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  DELETED_AT: 'deletedAt',
  
  // User fields
  EMAIL: 'email',
  DISPLAY_NAME: 'displayName',
  PHOTO_URL: 'photoURL',
  EMAIL_VERIFIED: 'emailVerified',
  
  // Account fields
  ACCOUNT_TYPE: 'accountType',
  ACCOUNT_NAME: 'accountName',
  BALANCE: 'balance',
  CURRENCY: 'currency',
  IS_ACTIVE: 'isActive',
  
  // Transaction fields
  AMOUNT: 'amount',
  TYPE: 'type',
  CATEGORY: 'category',
  DESCRIPTION: 'description',
  DATE: 'date',
  ACCOUNT_ID: 'accountId',
  
  // Category fields
  NAME: 'name',
  COLOR: 'color',
  ICON: 'icon',
  
  // Goal fields
  TARGET_AMOUNT: 'targetAmount',
  CURRENT_AMOUNT: 'currentAmount',
  TARGET_DATE: 'targetDate',
  STATUS: 'status',
  
  // EMI fields
  PRINCIPAL_AMOUNT: 'principalAmount',
  INTEREST_RATE: 'interestRate',
  TENURE_MONTHS: 'tenureMonths',
  MONTHLY_EMI: 'monthlyEmi',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  
  // Investment fields
  INVESTMENT_TYPE: 'investmentType',
  CURRENT_VALUE: 'currentValue',
  INVESTED_AMOUNT: 'investedAmount',
  RETURNS: 'returns',
  
  // Reminder fields
  REMINDER_TYPE: 'reminderType',
  REMINDER_DATE: 'reminderDate',
  IS_COMPLETED: 'isCompleted',
  
  // Settlement fields
  SETTLEMENT_TYPE: 'settlementType',
  SETTLEMENT_DATE: 'settlementDate',
  SETTLEMENT_AMOUNT: 'settlementAmount',
  
  // Policy fields
  POLICY_TYPE: 'policyType',
  POLICY_NUMBER: 'policyNumber',
  PREMIUM_AMOUNT: 'premiumAmount',
  COVERAGE_AMOUNT: 'coverageAmount',
} as const;
