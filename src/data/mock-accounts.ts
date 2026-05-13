export type AccountType =
  | 'Bank Account'
  | 'Cash'
  | 'Wallet'
  | 'Credit Card'
  | 'Trading Account'
  | 'Crypto Wallet';

export interface AccountModel {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // cents or smallest unit
  color?: string; // hex
  icon?: string; // emoji fallback or icon key
}

export const MOCK_ACCOUNTS: AccountModel[] = [
  {
    id: 'a1',
    name: 'HDFC Savings',
    type: 'Bank Account',
    balance: 12500000,
    icon: '🏦',
    color: '#4A90E2',
  },
  {
    id: 'a2',
    name: 'Pocket Cash',
    type: 'Cash',
    balance: 42000,
    icon: '💵',
    color: '#F5A623',
  },
  {
    id: 'a3',
    name: 'Phone Wallet',
    type: 'Wallet',
    balance: 780000,
    icon: '📱',
    color: '#50E3C2',
  },
  {
    id: 'a4',
    name: 'Platinum Card',
    type: 'Credit Card',
    balance: -2500000,
    icon: '💳',
    color: '#9B51E0',
  },
  {
    id: 'a5',
    name: 'Equities Trading',
    type: 'Trading Account',
    balance: 5600000,
    icon: '📈',
    color: '#10B981',
  },
  {
    id: 'a6',
    name: 'CoinSafe',
    type: 'Crypto Wallet',
    balance: 3200000,
    icon: '🪙',
    color: '#F7931A',
  },
];

export function getTotalBalance(accounts: AccountModel[]) {
  return accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
}
