import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import { Transaction, TransactionType, WhereClause, ServiceResponse, ListResponse } from '../../types/firestore';

/**
 * Transactions service for managing financial transactions
 * Extends BaseFirestoreService with transaction-specific methods
 */
export class TransactionsService extends BaseFirestoreService<Transaction> {
  constructor() {
    super(COLLECTIONS.TRANSACTIONS);
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    userId: string,
    transactionData: Partial<Transaction>
  ): Promise<ServiceResponse<Transaction>> {
    const data = {
      ...transactionData,
      userId,
    };
    return this.create(data);
  }

  /**
   * Create a transaction with specific ID
   */
  async createTransactionWithId(
    id: string,
    userId: string,
    transactionData: Partial<Transaction>
  ): Promise<ServiceResponse<Transaction>> {
    const data = {
      ...transactionData,
      userId,
    };
    return this.createWithId(id, data);
  }

  /**
   * Get transactions for a specific user
   */
  async getUserTransactions(
    userId: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    return this.getByUserId(userId, options);
  }

  /**
   * Get transactions by account
   */
  async getTransactionsByAccount(
    userId: string,
    accountId: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'accountId',
        operator: '==',
        value: accountId,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get transactions by type (income/expense/transfer)
   */
  async getTransactionsByType(
    userId: string,
    type: TransactionType,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'type',
        operator: '==',
        value: type,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get transactions by category
   */
  async getTransactionsByCategory(
    userId: string,
    category: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'category',
        operator: '==',
        value: category,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get transactions within a date range
   */
  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'date',
        operator: '>=',
        value: startDate,
      },
      {
        field: 'date',
        operator: '<=',
        value: endDate,
      },
    ];
    
    return this.list({
      ...options,
      where: whereClauses,
    });
  }

  /**
   * Get recurring transactions
   */
  async getRecurringTransactions(
    userId: string,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const whereClauses: WhereClause[] = [
      {
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        field: 'isRecurring',
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
   * Get transactions for a specific month
   */
  async getTransactionsByMonth(
    userId: string,
    year: number,
    month: number,
    options?: any
  ): Promise<ServiceResponse<ListResponse<Transaction>>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.getTransactionsByDateRange(userId, startDate, endDate, options);
  }
}

// Export singleton instance
export const transactionsService = new TransactionsService();
