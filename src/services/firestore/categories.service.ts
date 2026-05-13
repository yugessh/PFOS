import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  deletedAt?: any;
}

/**
 * Categories service for managing budget categories
 */
export class CategoriesService extends BaseFirestoreService<Category> {
  constructor() {
    super(COLLECTIONS.CATEGORIES);
  }

  /**
   * Get categories for a specific user
   */
  async getUserCategories(userId: string) {
    return this.getByUserId(userId);
  }

  /**
   * Get expense categories for a user
   */
  async getExpenseCategories(userId: string) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'type', operator: '==', value: 'expense' },
      ],
    });
  }

  /**
   * Get income categories for a user
   */
  async getIncomeCategories(userId: string) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'type', operator: '==', value: 'income' },
      ],
    });
  }
}

export const categoriesService = new CategoriesService();
