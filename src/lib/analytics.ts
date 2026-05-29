import type { ExpenseBreakdownItem, MonthlySpendingRow } from '@/types';
import type { Transaction } from '@/src/types/transaction';
import type { InvestmentModel } from '@/src/lib/investments';
import type { TradeRecord } from '@/src/services/firestore/tradingJournal.service';
import { formatDate } from '@/lib/date';

type TransactionLike = Pick<Transaction, 'amount' | 'category' | 'type'> & { date: Date | string };

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function getTransactionAmount(transaction: TransactionLike) {
  return Number(transaction.amount || 0);
}

export function buildCashflowSeries(transactions: TransactionLike[], days = 30) {
  const dayMs = 24 * 60 * 60 * 1000;
  const series = new Map<string, number>();
  const now = Date.now();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now - index * dayMs);
    series.set(formatDate(date), 0);
  }

  transactions.forEach((transaction) => {
    const key = formatDate(toDate(transaction.date));
    series.set(key, (series.get(key) || 0) + getTransactionAmount(transaction));
  });

  return Array.from(series.entries()).map(([date, value]) => ({ date, value }));
}

export function buildMonthlySpendingSeries(transactions: TransactionLike[], months = 6): MonthlySpendingRow[] {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const income = transactions
      .filter((transaction) => {
        const currentDate = toDate(transaction.date);
        return currentDate.getFullYear() === year && currentDate.getMonth() === month && transaction.type === 'income';
      })
      .reduce((sum, transaction) => sum + getTransactionAmount(transaction), 0);

    const spending = transactions
      .filter((transaction) => {
        const currentDate = toDate(transaction.date);
        return currentDate.getFullYear() === year && currentDate.getMonth() === month && transaction.type === 'expense';
      })
      .reduce((sum, transaction) => sum + getTransactionAmount(transaction), 0);

    return {
      month: monthLabel(date),
      spending,
      income,
    };
  });
}

export function buildExpenseBreakdown(transactions: TransactionLike[]): ExpenseBreakdownItem[] {
  const map = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = `${transaction.category || 'Other'}`;
      map.set(category, (map.get(category) || 0) + getTransactionAmount(transaction));
    });

  const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(map.entries())
    .map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildTradePerformance(trades: TradeRecord[]) {
  const pnlSeries = trades
    .slice()
    .reverse()
    .map((trade) => {
      const pnl =
        typeof trade.pnl === 'number'
          ? trade.pnl
          : ((trade.exitPrice ?? trade.sellPrice ?? 0) - (trade.entryPrice ?? trade.buyPrice ?? 0)) * (trade.quantity ?? 1);
      return {
        date: toDate(trade.date).toISOString().slice(0, 10),
        pnl,
      };
    });

  const total = trades.length;
  const wins = trades.filter((trade) => {
    const pnl =
      typeof trade.pnl === 'number'
        ? trade.pnl
        : ((trade.exitPrice ?? trade.sellPrice ?? 0) - (trade.entryPrice ?? trade.buyPrice ?? 0)) * (trade.quantity ?? 1);
    return pnl > 0;
  }).length;
  const losses = total - wins;

  const totalPnl = trades.reduce((sum, trade) => {
    const pnl =
      typeof trade.pnl === 'number'
        ? trade.pnl
        : ((trade.exitPrice ?? trade.sellPrice ?? 0) - (trade.entryPrice ?? trade.buyPrice ?? 0)) * (trade.quantity ?? 1);
    return sum + pnl;
  }, 0);

  const rrEntries = trades.filter((trade) => typeof trade.riskReward === 'number');
  const averageRR = rrEntries.length > 0 ? rrEntries.reduce((sum, trade) => sum + (trade.riskReward || 0), 0) / rrEntries.length : 0;

  return {
    total,
    wins,
    losses,
    winRate: total === 0 ? 0 : (wins / total) * 100,
    totalPnl,
    averageRR: Number.isFinite(averageRR) ? averageRR : 0,
    pnlSeries,
  };
}

export function buildInvestmentAllocation(investments: InvestmentModel[]) {
  return investments.map((investment) => ({
    name: investment.name,
    value: investment.currentValue || 0,
  }));
}
