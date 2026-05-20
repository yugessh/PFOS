import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/src/constants/collections';
import type {
  BudgetCategory,
  BudgetTracking,
  BudgetAlert,
} from '@/src/types/firestore';

/**
 * Budget System Service
 * Manages budget creation, tracking, and smart alerts
 */
export class BudgetCategoryService extends BaseFirestoreService<BudgetCategory> {
  constructor() {
    super(COLLECTIONS.BUDGET_CATEGORIES);
  }

  async createBudgetCategory(
    userId: string,
    category: string,
    monthlyLimit: number,
    alertThreshold: number = 80,
    currency: string = 'INR'
  ) {
    const payload: Partial<BudgetCategory> = {
      userId,
      category,
      monthlyLimit,
      alertThreshold,
      currency,
      isActive: true,
    };

    return this.create(payload);
  }

  async getUserBudgets(userId: string) {
    try {
      return this.getByUserId(userId);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getBudgetsByMonth(userId: string, month: string) {
    try {
      const tracingService = new BudgetTrackingService();
      return tracingService.getMonthlyBudgets(userId, month);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export class BudgetTrackingService extends BaseFirestoreService<BudgetTracking> {
  constructor() {
    super(COLLECTIONS.BUDGET_TRACKING);
  }

  /**
   * Get or create monthly budget tracking for category
   */
  async getOrCreateTracking(
    userId: string,
    budgetCategoryId: string,
    category: string,
    limit: number,
    currency: string = 'INR'
  ) {
    try {
      const month = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Check if already exists
      const tracking: Partial<BudgetTracking> = {
        userId,
        budgetCategoryId,
        category,
        month,
        limit,
        spent: 0,
        remaining: limit,
        alertsSent: [],
        isExceeded: false,
        currency,
      };

      return this.create(tracking);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update budget spent amount
   */
  async updateSpent(
    budgetId: string,
    spentAmount: number,
    alertThreshold: number = 80
  ) {
    try {
      const remaining = Math.max(0, 0); // Will be calculated from limit - spent
      const isExceeded = spentAmount > 0; // Placeholder logic

      const update: Partial<BudgetTracking> = {
        spent: spentAmount,
        remaining,
        isExceeded,
      };

      return this.update(budgetId, update);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current month budgets
   */
  async getMonthlyBudgets(userId: string, month?: string) {
    try {
      const targetMonth = month || new Date().toISOString().slice(0, 7);

      // In real implementation, would query by userId and month
      // For now, return empty as structure placeholder
      return {
        success: true,
        data: [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get budget health score (0-100)
   * 100 = within budget, lower = exceeding
   */
  async calculateHealthScore(budgets: BudgetTracking[]): Promise<number> {
    if (budgets.length === 0) return 100;

    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    if (totalLimit === 0) return 100;

    const percentUsed = (totalSpent / totalLimit) * 100;
    return Math.max(0, 100 - percentUsed);
  }
}

export class BudgetAlertService extends BaseFirestoreService<BudgetAlert> {
  constructor() {
    super(COLLECTIONS.BUDGET_ALERTS);
  }

  /**
   * Check and create alerts if thresholds crossed
   */
  async checkAndCreateAlerts(
    userId: string,
    budgetCategoryId: string,
    category: string,
    spent: number,
    limit: number,
    alertThreshold: number = 80
  ) {
    try {
      const percentUsed = (spent / limit) * 100;
      const thresholds = [80, 90, 100];
      const alerts: Partial<BudgetAlert>[] = [];

      for (const threshold of thresholds) {
        if (percentUsed >= threshold && percentUsed < thresholds[thresholds.indexOf(threshold) + 1]) {
          alerts.push({
            userId,
            budgetCategoryId,
            category,
            threshold,
            spent,
            limit,
            percentUsed: Math.round(percentUsed),
            status: 'pending',
            sentAt: new Date(),
          });
        }
      }

      // Create all pending alerts
      for (const alert of alerts) {
        await this.create(alert);
      }

      return {
        success: true,
        data: alerts,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pending alerts for user
   */
  async getPendingAlerts(userId: string) {
    try {
      // Query for pending alerts - placeholder structure
      return {
        success: true,
        data: [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string) {
    return this.update(alertId, { status: 'read' });
  }
}

export const budgetCategoryService = new BudgetCategoryService();
export const budgetTrackingService = new BudgetTrackingService();
export const budgetAlertService = new BudgetAlertService();
