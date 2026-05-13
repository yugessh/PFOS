import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  deletedAt?: any;
}

/**
 * Accounts service for managing user bank accounts
 */
export class AccountsService extends BaseFirestoreService<Account> {
  constructor() {
    super(COLLECTIONS.ACCOUNTS);
  }

  /**
   * Get accounts for a specific user
   */
  async getUserAccounts(userId: string) {
    return this.getByUserId(userId);
  }

  /**
   * Get active accounts for a user
   */
  async getActiveAccounts(userId: string) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isActive', operator: '==', value: true },
      ],
    });
  }

  /**
   * Update account balance
   */
  async updateBalance(accountId: string, newBalance: number) {
    return this.update(accountId, { balance: newBalance } as any);
  }
}

export const accountsService = new AccountsService();
