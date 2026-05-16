import { useState, useCallback, useEffect } from 'react';
import { useTransactions } from './useTransactions';
import { useAccounts } from './useAccounts';
import type { Transaction } from '@/src/types/transaction';
import type { Account } from '@/src/types/account';

export interface SearchResult {
  type: 'transaction' | 'account' | 'goal' | 'investment' | 'emi' | 'policy' | 'settlement' | 'subscription' | 'notification' | 'trading-journal';
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  date?: Date;
  icon?: string;
  data: any;
}

export interface SearchGroup {
  name: string;
  results: SearchResult[];
}

const RECENT_SEARCHES_KEY = 'pfos_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useGlobalSearch() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save a search to recent searches
  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent search:', error);
      }
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  // Search across all entities
  const search = useCallback(
    (query: string): SearchGroup[] => {
      if (!query.trim()) return [];

      const lowerQuery = query.toLowerCase();
      const groups: SearchGroup[] = [];

      // Search transactions
      const transactionResults = transactions
        .filter(
          (tx) =>
            tx.description?.toLowerCase().includes(lowerQuery) ||
            tx.category?.toLowerCase().includes(lowerQuery) ||
            tx.amount.toString().includes(query)
        )
        .slice(0, 5)
        .map((tx) => ({
          type: 'transaction' as const,
          id: tx.id,
          title: tx.description,
          subtitle: `${tx.type} • ${tx.category}`,
          amount: tx.amount,
          date: tx.date,
          icon: tx.type === 'income' ? '📥' : '📤',
          data: tx,
        }));

      if (transactionResults.length > 0) {
        groups.push({ name: 'Transactions', results: transactionResults });
      }

      // Search accounts
      const accountResults = accounts
        .filter((acc) => acc.name?.toLowerCase().includes(lowerQuery))
        .slice(0, 5)
        .map((acc) => ({
          type: 'account' as const,
          id: acc.id,
          title: acc.name,
          subtitle: `${acc.type} • $${acc.balance?.toFixed(2) || '0.00'}`,
          amount: acc.balance,
          icon: acc.icon || '💳',
          data: acc,
        }));

      if (accountResults.length > 0) {
        groups.push({ name: 'Accounts', results: accountResults });
      }

      // TODO: Add more entity types (goals, investments, EMI, policies, settlements, etc.)
      // as they are integrated into the system

      return groups;
    },
    [transactions, accounts]
  );

  return {
    search,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
