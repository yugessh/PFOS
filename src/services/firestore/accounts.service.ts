import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import { Account, AccountType, WhereClause, ServiceResponse, ListResponse } from '../../types/firestore';

/**
 * Accounts service for managing financial accounts
 * Extends BaseFirestoreService with account-specific methods
 */
export class AccountsService extends BaseFirestoreService<Account> {
  constructor() {
    super(COLLECTIONS.ACCOUNTS);
  }

  /**
   * Create a new account
   */
  async createAccount(
    userId: string,
    accountData: Partial<Account>
  ): Promise<ServiceResponse<Account>> {
    const data = {
      ...accountData,
      userId,
    };
    return this.create(data);
  }

  /**
   * Create an account with specific ID
   */
  async createAccountWithId(
    id: string,
    userId: string,
    accountData: Partial<Account>
  ): Promise<ServiceResponse<Account>> {
    const data = {
      ...accountData,
      userId,
    };
    return this.createWithId(id, data);
  }

  /**
   * Get accounts for a specific user
   */
  async getUserAccounts(
    userId: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Account>>> {
    return this.getByUserId(userId, options);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(
    userId: string,
    accountType: AccountType,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Account>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'accountType',
        operator: '==',
        value: accountType,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get active accounts for a user
   */
  async getActiveAccounts(
    userId: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Account>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'isActive',
        operator: '==',
        value: true,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get default account for a user
   */
  async getDefaultAccount(
    userId: string
  ): Promise<ServiceResponse<Account>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'isDefault',
        operator: '==',
        value: true,
      },
    ];
    
    const response = await this.list({
      where: whereClauses,
      limit: 1,
    });
    
    if (!response.success || !response.data || response.data.data.length === 0) {
      return {
        success: false,
        error: 'No default account found',
        code: 'not-found',
      };
    }
    
    return {
      success: true,
      data: response.data.data[0],
    };
  }

  /**
   * Get account by account number
   */
  async getAccountByNumber(
    userId: string,
    accountNumber: string
  ): Promise<ServiceResponse<Account>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'accountNumber',
        operator: '==',
        value: accountNumber,
      },
    ];
    
    const response = await this.list({
      where: whereClauses,
      limit: 1,
    });
    
    if (!response.success || !response.data || response.data.data.length === 0) {
      return {
        success: false,
        error: 'Account not found',
        code: 'not-found',
      };
    }
    
    return {
      success: true,
      data: response.data.data[0],
    };
  }

  /**
   * Update account balance
   */
  async updateAccountBalance(
    accountId: string,
    newBalance: number
  ): Promise<ServiceResponse<Account>> {
    return this.update(accountId, {
      balance: newBalance,
      lastUpdated: new Date(),
    });
  }

  /**
   * Set account as default
   */
  async setAsDefault(
    accountId: string,
    userId: string
  ): Promise<ServiceResponse<void>> {
    // First, unset all other accounts as default
    const accountsResponse = await this.getUserAccounts(userId);
    
    if (accountsResponse.success && accountsResponse.data) {
      for (const account of accountsResponse.data.data) {
        if (account.isDefault && account.id !== accountId) {
          await this.update(account.id, { isDefault: false });
        }
      }
    }
    
    // Set this account as default
    const response = await this.update(accountId, { isDefault: true });
    
    return response.success ? { success: true } : { success: false, error: response.error, code: response.code };
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(accountId: string): Promise<ServiceResponse<Account>> {
    return this.update(accountId, {
      isActive: false,
      lastUpdated: new Date(),
    });
  }

  /**
   * Activate account
   */
  async activateAccount(accountId: string): Promise<ServiceResponse<Account>> {
    return this.update(accountId, {
      isActive: true,
      lastUpdated: new Date(),
    });
  }

  /**
   * Calculate total balance across all accounts for a user
   */
  async getTotalBalance(
    userId: string,
    accountType?: AccountType
  ): Promise<ServiceResponse<number>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'isActive',
        operator: '==',
        value: true,
      },
    ];

    if (accountType) {
      whereClauses.push({
        field: 'accountType',
        operator: '==',
        value: accountType,
      });
    }
    
    const response = await this.list({
      where: whereClauses,
    });
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
        code: response.code,
      };
    }
    
    const totalBalance = response.data.data.reduce((sum, account) => sum + account.balance, 0);
    
    return {
      success: true,
      data: totalBalance,
    };
  }

  /**
   * Get accounts by currency
   */
  async getAccountsByCurrency(
    userId: string,
    currency: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Account>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'currency',
        operator: '==',
        value: currency,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
