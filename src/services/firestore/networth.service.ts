import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/src/constants/collections';
import type { NetWorthSnapshot } from '@/src/types/firestore';

/**
 * Net Worth Engine Service
 * Calculates and tracks net worth based on accounts and liabilities
 */
export class NetWorthService extends BaseFirestoreService<NetWorthSnapshot> {
  constructor() {
    super(COLLECTIONS.NET_WORTH_SNAPSHOTS);
  }

  /**
   * Calculate current net worth from accounts and liabilities
   * Assets: sum of account balances + investments
   * Liabilities: EMI remaining amounts + credit card balances
   */
  async calculateNetWorth(
    userId: string,
    accounts: any[] = [],
    investments: any[] = [],
    emis: any[] = [],
    creditCards: any[] = [],
    debts: any[] = []
  ): Promise<{ assets: number; liabilities: number; netWorth: number }> {
    try {
      let totalAssets = 0;
      let totalLiabilities = 0;

      // Sum account balances (assets)
      if (accounts && accounts.length > 0) {
        totalAssets += accounts.reduce((sum, acc) => {
          const balance = (acc.balance || acc.currentBalance || 0);
          // Skip negative balance credit cards (counted in liabilities)
          return sum + Math.max(0, balance);
        }, 0);
      }

      // Add investment values (assets)
      if (investments && investments.length > 0) {
        totalAssets += investments.reduce((sum, inv) => {
          return sum + (inv.currentValue || inv.investedAmount || 0);
        }, 0);
      }

      // Add outstanding lent balances as assets
      if (debts && debts.length > 0) {
        totalAssets += debts.reduce((sum, debt) => {
          if (debt.type === 'lent') {
            return sum + (debt.remainingAmount || 0);
          }
          return sum;
        }, 0);

        totalLiabilities += debts.reduce((sum, debt) => {
          if (debt.type === 'borrowed') {
            return sum + (debt.remainingAmount || 0);
          }
          return sum;
        }, 0);
      }

      // Sum EMI remaining amounts (liabilities)
      if (emis && emis.length > 0) {
        totalLiabilities += emis.reduce((sum, emi) => {
          return sum + (emi.remainingAmount || 0);
        }, 0);
      }

      // Add credit card balances (liabilities)
      if (creditCards && creditCards.length > 0) {
        totalLiabilities += creditCards.reduce((sum, card) => {
          const balance = card.balance || 0;
          return sum + Math.abs(Math.min(0, balance));
        }, 0);
      }

      return {
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      };
    } catch (error: any) {
      console.error('Error calculating net worth:', error);
      return { assets: 0, liabilities: 0, netWorth: 0 };
    }
  }

  /**
   * Create net worth snapshot for current month
   */
  async createSnapshot(
    userId: string,
    totalAssets: number,
    totalLiabilities: number,
    assetBreakdown: Record<string, number>,
    liabilityBreakdown: Record<string, number>,
    currency: string = 'INR'
  ) {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const netWorth = totalAssets - totalLiabilities;

    const snapshot: Partial<NetWorthSnapshot> = {
      userId,
      totalAssets,
      totalLiabilities,
      netWorth,
      currency,
      month,
      assetBreakdown,
      liabilityBreakdown,
    };

    return this.create(snapshot);
  }

  /**
   * Get net worth history for date range
   */
  async getNetWorthHistory(userId: string, months: number = 12) {
    try {
      const _db = require('firebase/firestore');
      if (!this.collectionRef) {
        return { success: false, error: 'Firestore not initialized' };
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const q = _db.query(
        this.collectionRef,
        _db.where('userId', '==', userId),
        _db.where('createdAt', '>=', startDate),
        _db.orderBy('createdAt', 'desc'),
        _db.limit(100)
      );

      const docs = await _db.getDocs(q);
      const history = docs.docs.map((doc: any) => this.convertDocument(doc));

      return {
        success: true,
        data: history,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get monthly net worth trend
   */
  async getMonthlyTrend(userId: string, months: number = 12) {
    try {
      const history = await this.getNetWorthHistory(userId, months);
      if (!history.success) return history;

      // Group by month and calculate gain/loss
      const trend = (history.data || []).map((snapshot: any, index: number) => {
        let gainLoss = 0;
        let gainLossPercent = 0;

        if (index < (history.data?.length || 0) - 1) {
          const prevSnapshot = history.data?.[index + 1];
          if (prevSnapshot) {
            gainLoss = snapshot.netWorth - prevSnapshot.netWorth;
            gainLossPercent =
              ((gainLoss / Math.abs(prevSnapshot.netWorth || 1)) * 100);
          }
        }

        return {
          month: snapshot.month,
          netWorth: snapshot.netWorth,
          assets: snapshot.totalAssets,
          liabilities: snapshot.totalLiabilities,
          gainLoss,
          gainLossPercent,
        };
      });

      return {
        success: true,
        data: trend,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const netWorthService = new NetWorthService();
