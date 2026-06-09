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
