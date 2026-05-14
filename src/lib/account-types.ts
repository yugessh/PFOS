export type CanonicalAccountType =
  | 'cash'
  | 'savings'
  | 'checking'
  | 'credit_card'
  | 'investment'
  | 'loan'
  | 'wallet'
  | 'crypto_wallet';

export interface AccountTypeOption {
  value: CanonicalAccountType;
  label: string;
  icon: string;
  description: string;
}

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  { value: 'cash', label: 'Cash', icon: '💵', description: 'Physical cash in hand' },
  { value: 'savings', label: 'Savings Account', icon: '🏦', description: 'Savings and deposits' },
  { value: 'checking', label: 'Checking Account', icon: '🏛️', description: 'Daily spending account' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳', description: 'Card with credit limit' },
  { value: 'investment', label: 'Investment', icon: '📈', description: 'Stocks, funds, and assets' },
  { value: 'loan', label: 'Loan', icon: '🧾', description: 'Borrowings and liabilities' },
  { value: 'wallet', label: 'Wallet', icon: '👛', description: 'UPI and digital wallet balance' },
  { value: 'crypto_wallet', label: 'Crypto Wallet', icon: '🪙', description: 'Crypto assets and tokens' },
];

const LEGACY_TYPE_MAP: Record<string, CanonicalAccountType> = {
  digital_wallet: 'wallet',
  debit_card: 'checking',
  other: 'wallet',
};

export function toCanonicalAccountType(type: string | undefined | null): CanonicalAccountType {
  if (!type) return 'checking';

  const direct = ACCOUNT_TYPE_OPTIONS.find((option) => option.value === type);
  if (direct) return direct.value;

  return LEGACY_TYPE_MAP[type] ?? 'checking';
}

export function getAccountTypeMeta(type: string | undefined | null): AccountTypeOption {
  const canonical = toCanonicalAccountType(type);
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === canonical) ?? ACCOUNT_TYPE_OPTIONS[2];
}

export function getAccountTypeLabel(type: string | undefined | null): string {
  return getAccountTypeMeta(type).label;
}

export function getAccountTypeIcon(type: string | undefined | null): string {
  return getAccountTypeMeta(type).icon;
}
