export type CanonicalAccountType =
  | 'bank_account'
  | 'cash'
  | 'upi_wallet'
  | 'credit_card'
  | 'savings_account'
  | 'investment_account'
  | 'crypto_wallet'
  | 'custom_account';

export interface AccountTypeOption {
  value: CanonicalAccountType;
  label: string;
  icon: string;
  description: string;
}

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  { value: 'bank_account', label: 'Bank Account', icon: '🏦', description: 'Primary banking account for payments and deposits' },
  { value: 'cash', label: 'Cash', icon: '💵', description: 'Physical cash on hand' },
  { value: 'upi_wallet', label: 'UPI Wallet', icon: '📲', description: 'UPI balance, payment apps, and digital wallets' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳', description: 'Credit card spending and repayment' },
  { value: 'savings_account', label: 'Savings Account', icon: '🌱', description: 'Savings and deposits' },
  { value: 'investment_account', label: 'Investment Account', icon: '📈', description: 'Stocks, mutual funds, and long-term assets' },
  { value: 'crypto_wallet', label: 'Crypto Wallet', icon: '🪙', description: 'Crypto holdings and tokens' },
  { value: 'custom_account', label: 'Custom Account', icon: '✨', description: 'Any custom money source or reserve' },
];

const LEGACY_TYPE_MAP: Record<string, CanonicalAccountType> = {
  checking: 'bank_account',
  savings: 'savings_account',
  investment: 'investment_account',
  loan: 'custom_account',
  wallet: 'upi_wallet',
  digital_wallet: 'upi_wallet',
  debit_card: 'bank_account',
  other: 'custom_account',
};

export function toCanonicalAccountType(type: string | undefined | null): CanonicalAccountType {
  if (!type) return 'bank_account';

  const direct = ACCOUNT_TYPE_OPTIONS.find((option) => option.value === type);
  if (direct) return direct.value;

  return LEGACY_TYPE_MAP[type] ?? 'bank_account';
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
