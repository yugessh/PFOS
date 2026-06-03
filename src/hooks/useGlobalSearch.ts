import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { useTransactions } from './useTransactions';
import { useAccounts } from './useAccounts';
import { useGoals } from './useGoals';
import { useInvestments } from './useInvestments';
import { useTradingJournal } from './useTradingJournal';
import { useNotifications } from './useNotifications';
import { useEvents } from './useEvents';
import { useBudgets } from './useBudgets';
import { useAutomations } from './useAutomations';
import { useInsights } from './useInsights';
import { documentsService } from '@/src/services/firestore/documents.service';
import reportsService from '@/src/services/firestore/reports.service';
import { assetService } from '@/src/services/firestore/asset.service';
import { familyService } from '@/src/services/firestore/family.service';
import { searchService, type SavedSearchRecord } from '@/src/services/firestore/search.service';
import { allNavItems } from '@/lib/navigation';

export type SearchFilter =
  | 'all'
  | 'transactions'
  | 'accounts'
  | 'goals'
  | 'investments'
  | 'reports'
  | 'documents'
  | 'notifications'
  | 'calendar'
  | 'assets'
  | 'liabilities';

export type SearchResultType =
  | 'command'
  | 'page'
  | 'transaction'
  | 'account'
  | 'budget'
  | 'goal'
  | 'investment'
  | 'report'
  | 'document'
  | 'notification'
  | 'calendar'
  | 'asset'
  | 'liability'
  | 'automation'
  | 'trading'
  | 'family'
  | 'insight';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  href?: string;
  icon?: string;
  tags?: string[];
  group: string;
  data: any;
  score: number;
}

export interface SearchGroup {
  name: string;
  results: SearchResult[];
}

export interface CommandItem {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: string;
}

const RECENT_SEARCHES_KEY = 'pfos_recent_searches';
const MAX_RECENT_SEARCHES = 10;

function normalize(text: string | number | null | undefined) {
  return String(text || '').toLowerCase().trim();
}

function scoreText(query: string, ...parts: Array<string | number | null | undefined>) {
  const needle = normalize(query);
  if (!needle) return 0;
  const haystack = parts.map(normalize).join(' ');
  if (!haystack) return 0;
  if (haystack === needle) return 160;
  if (haystack.startsWith(needle)) return 130;
  if (haystack.includes(needle)) return 100;

  let streakIndex = 0;
  for (const character of haystack) {
    if (character === needle[streakIndex]) streakIndex += 1;
    if (streakIndex === needle.length) return 70;
  }
  return 0;
}

function mapAmount(value: any) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function buildCommands(): CommandItem[] {
  return [
    { id: 'go-dashboard', label: 'Go to Dashboard', subtitle: 'Jump to PFOS home', href: '/dashboard', keywords: ['dashboard home summary'], icon: '⌘' },
    { id: 'create-transaction', label: 'Create Transaction', subtitle: 'Open transaction entry flow', href: '/transactions/add', keywords: ['create transaction add transaction'], icon: '⊕' },
    { id: 'add-expense', label: 'Add Expense', subtitle: 'Create a new expense transaction', href: '/transactions/add?type=expense', keywords: ['expense transaction spend'], icon: '↓' },
    { id: 'add-income', label: 'Add Income', subtitle: 'Create a new income transaction', href: '/transactions/add?type=income', keywords: ['income salary payment'], icon: '↑' },
    { id: 'create-goal', label: 'Create Goal', subtitle: 'Open savings goals', href: '/dashboard/goals', keywords: ['goal savings target'], icon: '◎' },
    { id: 'create-budget', label: 'Create Budget', subtitle: 'Open budgets planner', href: '/dashboard/budgets', keywords: ['budget planning limit'], icon: '◫' },
    { id: 'add-investment', label: 'Add Investment', subtitle: 'Open investments', href: '/dashboard/investments', keywords: ['investment portfolio buy sip'], icon: '↗' },
    { id: 'create-reminder', label: 'Create Reminder', subtitle: 'Open reminders workspace', href: '/dashboard/reminders', keywords: ['reminder bill due alert'], icon: '◔' },
    { id: 'create-document', label: 'Create Document', subtitle: 'Open document vault', href: '/dashboard/documents', keywords: ['document bill policy upload'], icon: '◧' },
    { id: 'open-reports', label: 'Open Reports', subtitle: 'View scheduled and analytics reports', href: '/dashboard/reports', keywords: ['report analytics export'], icon: '▣' },
    { id: 'open-ai-coach', label: 'Open AI Coach', subtitle: 'Jump into the financial coach', href: '/dashboard/ai-coach', keywords: ['ai coach recommendations insights'], icon: '✦' },
    { id: 'open-calendar', label: 'Open Calendar', subtitle: 'View financial calendar', href: '/dashboard/calendar', keywords: ['calendar event timeline'], icon: '☷' },
    { id: 'open-documents', label: 'Open Documents', subtitle: 'Bills, policies, and vault', href: '/dashboard/documents', keywords: ['documents bills policies vault'], icon: '◧' },
    { id: 'open-settings', label: 'Open Settings', subtitle: 'App and profile settings', href: '/dashboard/settings', keywords: ['settings preferences profile'], icon: '⚙' },
    { id: 'search-anything', label: 'Search Anything', subtitle: 'Keep typing to search every PFOS surface', href: '/dashboard', keywords: ['search anything global universal'], icon: '⌕' },
  ];
}

export function useGlobalSearch() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.uid ?? null;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);
  const [commandUsage, setCommandUsage] = useState<Record<string, number>>({});

  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const { trades } = useTradingJournal();
  const { notifications } = useNotifications();
  const { events } = useEvents();
  const { budgetItems } = useBudgets(transactions as any);
  const { automations } = useAutomations();
  const { insights } = useInsights();

  useEffect(() => {
    if (!userId) return;
    queueMicrotask(() => {
      void Promise.all([
        documentsService.getUserDocuments(userId),
        reportsService.getScheduledReports(userId),
        assetService.getAssets(userId),
        assetService.getLiabilities(userId),
        familyService.getUserGroups(userId),
        searchService.getSavedSearches(userId),
        searchService.getCommandUsage(userId),
      ]).then(([docsResponse, reportItems, assetItems, liabilityItems, groups, saved, usage]) => {
        const docItems = Array.isArray(docsResponse?.data)
          ? docsResponse.data
          : Array.isArray(docsResponse?.data?.data)
          ? docsResponse.data.data
          : [];
        setDocuments(docItems);
        setReports(Array.isArray(reportItems) ? reportItems : []);
        setAssets(Array.isArray(assetItems) ? assetItems : []);
        setLiabilities(Array.isArray(liabilityItems) ? liabilityItems : []);
        setFamilyGroups(Array.isArray(groups) ? groups : []);
        setSavedSearches(Array.isArray(saved) ? saved : []);
        setCommandUsage(
          (Array.isArray(usage) ? usage : []).reduce<Record<string, number>>((accumulator, record) => {
            accumulator[record.commandId] = (accumulator[record.commandId] || 0) + 1;
            return accumulator;
          }, {})
        );
      }).catch((error) => {
        console.error('Failed to load universal search data:', error);
      });
    });
  }, [userId]);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent search:', error);
      }
      return updated;
    });
    if (userId) {
      void searchService.saveSearch(userId, query);
    }
  }, [userId]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  const pinSearch = useCallback((query: string) => {
    if (!userId || !query.trim()) return;
    void searchService.pinSearch(userId, query, { favorite: true }).then(async () => {
      const nextSaved = await searchService.getSavedSearches(userId);
      setSavedSearches(nextSaved);
    });
  }, [userId]);

  const commands = useMemo(() => buildCommands(), []);

  const indexedResults = useMemo<SearchResult[]>(() => {
    const pages: SearchResult[] = allNavItems.map((item) => ({
      type: 'page',
      id: item.href,
      title: item.label,
      subtitle: item.description,
      href: item.href,
      icon: '◩',
      tags: ['page', 'navigation'],
      group: 'Pages',
      data: item,
      score: 0,
    }));

    const commandResults: SearchResult[] = commands.map((command) => ({
      type: 'command',
      id: command.id,
      title: command.label,
      subtitle: command.subtitle,
      href: command.href,
      icon: command.icon,
      tags: command.keywords,
      group: 'Commands',
      data: command,
      score: commandUsage[command.id] || 0,
    }));

    const transactionResults: SearchResult[] = (transactions || []).map((tx: any) => ({
      type: 'transaction',
      id: tx.id,
      title: tx.description || tx.category || 'Transaction',
      subtitle: `${tx.type} • ${tx.category || 'Uncategorized'}`,
      amount: mapAmount(tx.amount),
      href: '/dashboard/transactions',
      icon: tx.type === 'income' ? '↑' : '↓',
      tags: [tx.category, tx.description, tx.type],
      group: 'Transactions',
      data: tx,
      score: 0,
    }));

    const accountResults: SearchResult[] = (accounts || []).map((account: any) => ({
      type: 'account',
      id: account.id,
      title: account.name || account.accountName || 'Account',
      subtitle: `${account.accountType || account.type || 'Account'} • ${mapAmount(account.balance ?? account.currentBalance).toLocaleString()}`,
      amount: mapAmount(account.balance ?? account.currentBalance),
      href: '/dashboard/accounts',
      icon: '◫',
      tags: [account.accountType, account.type, account.bankName],
      group: 'Accounts',
      data: account,
      score: 0,
    }));

    const budgetResults: SearchResult[] = (budgetItems || []).map((budget: any) => ({
      type: 'budget',
      id: budget.id,
      title: budget.categoryName,
      subtitle: `Budget • spent ${mapAmount(budget.spent).toLocaleString()} of ${mapAmount(budget.monthlyLimit).toLocaleString()}`,
      amount: mapAmount(budget.spent),
      href: '/dashboard/budgets',
      icon: '◨',
      tags: [budget.categoryName, 'budget'],
      group: 'Budgets',
      data: budget,
      score: 0,
    }));

    const goalResults: SearchResult[] = (goals || []).map((goal: any) => ({
      type: 'goal',
      id: goal.id,
      title: goal.title,
      subtitle: `Goal • saved ${mapAmount(goal.savedAmount).toLocaleString()} of ${mapAmount(goal.targetAmount).toLocaleString()}`,
      amount: mapAmount(goal.targetAmount),
      href: '/dashboard/goals',
      icon: '◎',
      tags: [goal.category, goal.notes],
      group: 'Goals',
      data: goal,
      score: 0,
    }));

    const investmentResults: SearchResult[] = (investments || []).map((investment: any) => ({
      type: 'investment',
      id: investment.id,
      title: investment.name,
      subtitle: `${investment.type || 'Investment'} • value ${mapAmount(investment.currentValue).toLocaleString()}`,
      amount: mapAmount(investment.currentValue),
      href: '/dashboard/investments',
      icon: '↗',
      tags: [investment.type, investment.notes],
      group: 'Investments',
      data: investment,
      score: 0,
    }));

    const tradingResults: SearchResult[] = (trades || []).map((trade: any) => ({
      type: 'trading',
      id: trade.id,
      title: trade.asset || trade.symbol || trade.setup || 'Trade',
      subtitle: `Trading journal • ${trade.strategy || trade.status || 'Entry'}`,
      amount: mapAmount(trade.pnl),
      href: '/dashboard/trading-journal',
      icon: '⌁',
      tags: [trade.asset, trade.symbol, trade.strategy, trade.notes],
      group: 'Trading Journal',
      data: trade,
      score: 0,
    }));

    const notificationResults: SearchResult[] = (notifications || []).map((notification: any) => ({
      type: 'notification',
      id: notification.id,
      title: notification.title,
      subtitle: notification.message,
      href: '/dashboard/notifications',
      icon: '●',
      tags: [notification.module, notification.priority],
      group: 'Notifications',
      data: notification,
      score: 0,
    }));

    const eventResults: SearchResult[] = (events || []).map((event: any) => ({
      type: 'calendar',
      id: event.id,
      title: event.title,
      subtitle: `${event.linkedModule || 'Calendar'} • ${event.status || 'upcoming'}`,
      href: '/dashboard/calendar',
      icon: '☷',
      tags: [event.linkedModule, event.eventType, event.notes],
      group: 'Calendar',
      data: event,
      score: 0,
    }));

    const documentResults: SearchResult[] = (documents || []).map((document: any) => ({
      type: 'document',
      id: document.id,
      title: document.title,
      subtitle: `${document.category || 'Document'} • ${document.provider || document.status || 'Vault item'}`,
      href: '/dashboard/documents',
      icon: '◧',
      tags: [document.category, document.provider, document.notes],
      group: 'Documents',
      data: document,
      score: 0,
    }));

    const reportResults: SearchResult[] = (reports || []).map((report: any) => ({
      type: 'report',
      id: report.id,
      title: report.name || 'Scheduled Report',
      subtitle: `${report.type || 'Report'} • ${report.cadence || 'manual'}`,
      href: '/dashboard/reports',
      icon: '▣',
      tags: [report.type, report.cadence],
      group: 'Reports',
      data: report,
      score: 0,
    }));

    const assetResults: SearchResult[] = (assets || []).map((asset: any) => ({
      type: 'asset',
      id: asset.id,
      title: asset.name || 'Asset',
      subtitle: `${asset.category || asset.type || 'Asset'} • ${mapAmount(asset.currentValue ?? asset.value).toLocaleString()}`,
      amount: mapAmount(asset.currentValue ?? asset.value),
      href: '/dashboard/wealth-inventory',
      icon: '⬢',
      tags: [asset.category, asset.type, asset.description],
      group: 'Assets',
      data: asset,
      score: 0,
    }));

    const liabilityResults: SearchResult[] = (liabilities || []).map((liability: any) => ({
      type: 'liability',
      id: liability.id,
      title: liability.name || 'Liability',
      subtitle: `${liability.category || liability.type || 'Liability'} • ${mapAmount(liability.outstandingAmount ?? liability.amount).toLocaleString()}`,
      amount: mapAmount(liability.outstandingAmount ?? liability.amount),
      href: '/dashboard/wealth-inventory',
      icon: '⬡',
      tags: [liability.category, liability.type, liability.description],
      group: 'Liabilities',
      data: liability,
      score: 0,
    }));

    const automationResults: SearchResult[] = (automations || []).map((automation: any) => ({
      type: 'automation',
      id: automation.id,
      title: automation.name || automation.title || 'Automation',
      subtitle: `${automation.enabled ? 'Enabled' : 'Disabled'} • ${automation.trigger || 'Rule'}`,
      href: '/dashboard/automations',
      icon: '⌬',
      tags: [automation.trigger, automation.description],
      group: 'Automation',
      data: automation,
      score: 0,
    }));

    const familyResults: SearchResult[] = (familyGroups || []).map((group: any) => ({
      type: 'family',
      id: group.id,
      title: group.name || 'Family Group',
      subtitle: `Family finance • ${(group.members || []).length} members`,
      href: '/dashboard/family',
      icon: '◌',
      tags: [(group.members || []).map((member: any) => member.displayName).join(' ')],
      group: 'Family Finance',
      data: group,
      score: 0,
    }));

    const insightResults: SearchResult[] = (insights || []).map((insight: any) => ({
      type: 'insight',
      id: insight.id,
      title: insight.title,
      subtitle: insight.description,
      href: '/dashboard/ai-coach',
      icon: '✦',
      tags: [insight.insightType, insight.sourceModule, insight.priority],
      group: 'AI Coach',
      data: insight,
      score: 0,
    }));

    return [
      ...commandResults,
      ...pages,
      ...transactionResults,
      ...accountResults,
      ...budgetResults,
      ...goalResults,
      ...investmentResults,
      ...tradingResults,
      ...notificationResults,
      ...eventResults,
      ...documentResults,
      ...reportResults,
      ...assetResults,
      ...liabilityResults,
      ...automationResults,
      ...familyResults,
      ...insightResults,
    ];
  }, [accounts, assets, automations, budgetItems, commands, commandUsage, documents, events, familyGroups, goals, insights, investments, liabilities, notifications, reports, trades, transactions]);

  const search = useCallback((query: string, filter: SearchFilter = 'all'): SearchGroup[] => {
    const needle = query.trim();
    if (!needle) return [];

    const filterMap: Record<SearchFilter, SearchResultType[] | null> = {
      all: null,
      transactions: ['transaction'],
      accounts: ['account'],
      goals: ['goal'],
      investments: ['investment'],
      reports: ['report'],
      documents: ['document'],
      notifications: ['notification'],
      calendar: ['calendar'],
      assets: ['asset'],
      liabilities: ['liability'],
    };

    const allowed = filterMap[filter];
    const results = indexedResults
      .filter((item) => !allowed || allowed.includes(item.type))
      .map((item) => {
        const score = scoreText(needle, item.title, item.subtitle, item.tags?.join(' '), item.group);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 36);

    const grouped = results.reduce<Record<string, SearchResult[]>>((accumulator, item) => {
      accumulator[item.group] = accumulator[item.group] || [];
      accumulator[item.group].push(item);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, groupResults]) => ({
      name,
      results: groupResults.slice(0, 6),
    }));
  }, [indexedResults]);

  const popularCommands = useMemo(() => {
    return commands
      .slice()
      .sort((left, right) => (commandUsage[right.id] || 0) - (commandUsage[left.id] || 0))
      .slice(0, 5);
  }, [commandUsage, commands]);

  const searchAnalytics = useMemo(() => ({
    totalIndexedItems: indexedResults.length,
    recentSearchCount: recentSearches.length,
    savedSearchCount: savedSearches.length,
    mostSearchedItems: recentSearches.slice(0, 5),
    popularCommands: popularCommands.map((item) => item.label),
  }), [indexedResults.length, popularCommands, recentSearches, savedSearches.length]);

  const handleResultSelect = useCallback((result: SearchResult, activeQuery?: string) => {
    if (activeQuery?.trim()) addRecentSearch(activeQuery);
    if (result.type === 'command' && userId) {
      void searchService.recordCommandUsage(userId, result.id, result.title).then(() => {
        setCommandUsage((prev) => ({ ...prev, [result.id]: (prev[result.id] || 0) + 1 }));
      });
    }
    if (result.href) router.push(result.href);
  }, [addRecentSearch, router, userId]);

  return {
    search,
    commands,
    recentSearches,
    savedSearches,
    popularCommands,
    addRecentSearch,
    clearRecentSearches,
    pinSearch,
    handleResultSelect,
    searchAnalytics,
  };
}
