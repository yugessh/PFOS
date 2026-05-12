export interface Account {
  id: string;
  name: string;
  type: 'savings' | 'checking' | 'credit' | 'investment';
  balance: number;
  icon: string;
  color?: string;
}
