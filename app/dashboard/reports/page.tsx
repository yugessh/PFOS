'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  Filter,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAuthContext } from '@/src/context/AuthContext';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { budgetsService } from '@/src/services/firestore/budgets.service';
import { emiService } from '@/src/services/firestore/emi.service';
import { goalsService } from '@/src/services/firestore/goals.service';
import { investmentsService } from '@/src/services/firestore/investments.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { ChartCard } from '@/components/charts/ChartCard';
import { FilterSelect } from '@/components/filters/FilterSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card/StatCard';
import type { ExpenseBreakdownItem, MonthlySpendingRow } from '@/types';
import type { Transaction } from '@/src/types/firestore';
import type { Account } from '@/src/services/firestore/accounts.service';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CHART_COLORS = ['#2563EB', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#0ea5e9'];

function formatCurrency(value = 0) {
  const amount = Number(value || 0);
  return `₹${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function normalizeTransaction(raw: any): Transaction {
  return {
    ...raw,
    date: raw.date?.toDate?.() ?? new Date(raw.date || Date.now()),
    amount: Number(raw.amount || 0),
    category: raw.category || 'Other',
    type: raw.type || 'expense',
    accountId: raw.accountId || raw.account || '',
    userId: raw.userId || '',
    id: raw.id || '',
    description: raw.description || raw.notes || raw.category || '',
    isRecurring: raw.isRecurring || false,
    metadata: raw.metadata ?? {},
  } as Transaction;
}

function getMonthKey(year: number, month: number | string) {
  if (month === 'all') {
    return `${year}-all`;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getHeatColor(value: number) {
  if (value <= 1000) return '#c7d2fe';
  if (value <= 3000) return '#a5b4fc';
  if (value <= 8000) return '#818cf8';
  return '#4338ca';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ReportsPage() {
  const auth = useAuthContext();
  const userId = auth.user?.uid;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [emis, setEmis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const monthOptions = useMemo(
    () => [
      { value: 'all', label: 'All months' },
      ...MONTH_NAMES.map((label, index) => ({ value: String(index + 1), label })),
    ],
    []
  );

  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);
    transactions.forEach((tx) => years.add(new Date(tx.date).getFullYear()));
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) }));
  }, [currentYear, transactions]);

  const accountOptions = useMemo(
    () => [
      { value: 'all', label: 'All accounts' },
      ...accounts.map((account) => ({ value: account.id, label: account.accountName || account.name || 'Account' })),
    ],
    [accounts]
  );

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(transactions.map((tx) => tx.category || 'Other'))).sort();
    return [{ value: 'all', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))];
  }, [transactions]);

  const loadAllData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const monthKey = getMonthKey(selectedYear, selectedMonth);
    const [txRes, accountRes, budgetRes, goalsRes, investmentRes, emiRes] = await Promise.all([
      transactionsService.getUserTransactions(userId),
      accountsService.getUserAccounts(userId),
      budgetsService.getUserBudgets(userId, monthKey),
      goalsService.getUserGoals(userId),
      investmentsService.getUserInvestments(userId),
      emiService.getUserEMIs(userId),
    ]);

    setTransactions(
      txRes.success && txRes.data?.data
        ? txRes.data.data.map(normalizeTransaction)
        : []
    );
    setAccounts(accountRes.success && accountRes.data?.data ? accountRes.data.data : []);
    setBudgets(budgetRes.success && budgetRes.data?.data ? budgetRes.data.data : []);
    setGoals(goalsRes.success && goalsRes.data?.data ? goalsRes.data.data : []);
    setInvestments(investmentRes.success && investmentRes.data?.data ? investmentRes.data.data : []);
    setEmis(emiRes.success && emiRes.data?.data ? emiRes.data.data : []);
    setLoading(false);
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
      const monthMatch = selectedMonth === 'all' ? true : date.getMonth() + 1 === selectedMonth;
      const yearMatch = date.getFullYear() === selectedYear;
      const accountMatch = selectedAccount === 'all' ? true : tx.accountId === selectedAccount;
      const categoryMatch = selectedCategory === 'all' ? true : tx.category === selectedCategory;
      return monthMatch && yearMatch && accountMatch && categoryMatch;
    });
  }, [transactions, selectedMonth, selectedYear, selectedAccount, selectedCategory]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((total, tx) => total + tx.amount, 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((total, tx) => total + tx.amount, 0);
    const savings = income - expense;
    const cashFlow = income - expense;
    return { income, expense, savings, cashFlow };
  }, [filteredTransactions]);

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'All months';
    return MONTH_NAMES[selectedMonth - 1] || 'Month';
  }, [selectedMonth]);

  const trendData = useMemo<MonthlySpendingRow[]>(() => {
    const monthIndex = selectedMonth === 'all' ? currentMonth - 1 : selectedMonth - 1;
    const yearBase = selectedYear || currentYear;
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(yearBase, monthIndex - (5 - index), 1);
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    });

    return months.map(({ year, month }) => {
      const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
      const income = transactions
        .filter((tx) => {
          const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
          return date.getMonth() + 1 === month && date.getFullYear() === year && tx.type === 'income';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      const spending = transactions
        .filter((tx) => {
          const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
          return date.getMonth() + 1 === month && date.getFullYear() === year && tx.type === 'expense';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { month: monthLabel, income, spending };
    });
  }, [transactions, selectedMonth, selectedYear, currentMonth, currentYear]);

  const savingsTrend = useMemo(() => {
    return trendData.map((entry) => ({
      month: entry.month,
      savings: entry.income - entry.spending,
    }));
  }, [trendData]);

  const breakdownData = useMemo<ExpenseBreakdownItem[]>(() => {
    const categoryMap = new Map<string, number>();
    filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
      });

    const total = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0) || 1;
    return Array.from(categoryMap.entries())
      .map(([category, value]) => ({
        category,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const balanceDistribution = useMemo(() => {
    const visibleAccounts = accounts.filter(
      (account) => account.isActive !== false && (account.balance ?? 0) > 0 && !Number.isNaN(account.balance)
    );
    const fallbackAccounts = accounts.filter((account) => account.isActive !== false && !Number.isNaN(account.balance));
    const sourceAccounts = visibleAccounts.length > 0 ? visibleAccounts : fallbackAccounts;
    const total = sourceAccounts.reduce((sum, account) => sum + (account.balance || 0), 0) || 1;
    return sourceAccounts.map((account) => ({
      name: account.accountName || account.name || 'Account',
      value: account.balance || 0,
      percentage: Math.round(((account.balance || 0) / total) * 100),
    }));
  }, [accounts]);

  const weeklyHeatmap = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daily = dayNames.map((day) => ({ day, amount: 0 }));
    filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
        const day = dayNames[(date.getDay() + 6) % 7];
        const entry = daily.find((row) => row.day === day);
        if (entry) entry.amount += tx.amount;
      });
    return daily;
  }, [filteredTransactions]);

  const insights = useMemo(() => {
    const items: string[] = [];
    const topCategory = breakdownData[0];
    if (topCategory) {
      items.push(`Highest spending category: ${topCategory.category}`);
    }

    const referenceMonth = selectedMonth === 'all' ? currentMonth : selectedMonth;
    const lastMonthDate = new Date(selectedYear, referenceMonth - 2, 1);
    const lastMonthIncome = transactions
      .filter((tx) => {
        const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
        return date.getMonth() + 1 === lastMonthDate.getMonth() + 1 && date.getFullYear() === lastMonthDate.getFullYear() && tx.type === 'income';
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    const lastMonthExpense = transactions
      .filter((tx) => {
        const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
        return date.getMonth() + 1 === lastMonthDate.getMonth() + 1 && date.getFullYear() === lastMonthDate.getFullYear() && tx.type === 'expense';
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (summary.savings > lastMonthIncome - lastMonthExpense) {
      items.push('Savings improved compared to last month');
    }

    if (topCategory && lastMonthExpense > 0) {
      const lastCategorySpend = transactions
        .filter((tx) => {
          const date = tx.date instanceof Date ? tx.date : new Date(tx.date as unknown as string);
          return date.getMonth() + 1 === lastMonthDate.getMonth() + 1 && date.getFullYear() === lastMonthDate.getFullYear() && tx.type === 'expense' && tx.category === topCategory.category;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      const change = ((topCategory.value - lastCategorySpend) / Math.max(1, lastCategorySpend)) * 100;
      if (change > 8) {
        items.push(`${topCategory.category} spending increased ${Math.round(change)}%`);
      }
    }

    const upcomingEMI = emis.filter((item) => {
      const dueDate = item.nextDueDate?.toDate?.() ?? new Date(item.nextDueDate || item.dueDate || null);
      if (!dueDate) return false;
      const diff = Math.round((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 14;
    });
    if (upcomingEMI.length > 0) {
      items.push(`${upcomingEMI.length} subscription${upcomingEMI.length === 1 ? '' : 's'} due soon`);
    }

    const exceededBudget = budgets.find((budget) => {
      const spent = breakdownData.find((item) => item.category === budget.categoryName)?.value || 0;
      return budget.monthlyLimit && spent > budget.monthlyLimit;
    });
    if (exceededBudget) {
      items.push(`Budget exceeded in ${exceededBudget.categoryName}`);
    }

    if (items.length === 0) {
      items.push('Your report is on track—for deeper insights add more transactions or budgets.');
    }
    return items.slice(0, 5);
  }, [breakdownData, budgets, emis, currentDate, selectedMonth, selectedYear, summary.savings, transactions]);

  const healthScore = useMemo(() => {
    const income = summary.income;
    const expense = summary.expense;
    const savingsRate = income > 0 ? clamp((income - expense) / income, 0, 1) : 0;
    const savingsPoints = Math.round(savingsRate * 25);

    const budgetCount = budgets.length;
    const exceededCount = budgets.filter((budget) => {
      const spent = breakdownData.find((item) => item.category === budget.categoryName)?.value || 0;
      return budget.monthlyLimit && spent > budget.monthlyLimit;
    }).length;
    const disciplinePoints = budgetCount ? Math.round(clamp(1 - exceededCount / budgetCount, 0, 1) * 20) : 12;

    const totalAssets = Math.max(
      accounts.reduce((sum, account) => sum + Math.max(0, account.balance || 0), 0) +
        investments.reduce((sum, item) => sum + Math.max(0, item.currentValue || item.investedAmount || 0), 0),
      1
    );
    const totalDebt = Math.max(
      accounts.reduce((sum, account) => sum + Math.max(0, -(account.balance || 0)), 0),
      0
    );
    const debtRatio = clamp(totalDebt / (totalAssets + totalDebt), 0, 1);
    const debtPoints = Math.round((1 - debtRatio) * 25);

    const weeklySpendingValues = weeklyHeatmap.map((item) => item.amount);
    const averageWeekly = weeklySpendingValues.reduce((sum, value) => sum + value, 0) / Math.max(weeklySpendingValues.length, 1);
    const deviation = Math.sqrt(
      weeklySpendingValues.reduce((sum, value) => sum + Math.pow(value - averageWeekly, 2), 0) / Math.max(weeklySpendingValues.length, 1)
    );
    const consistencyPoints = Math.round(clamp(1 - deviation / Math.max(averageWeekly, 1), 0, 1) * 20);

    const dueSoon = emis.filter((item) => {
      const dueDate = item.nextDueDate?.toDate?.() ?? new Date(item.nextDueDate || item.dueDate || null);
      if (!dueDate) return false;
      const diff = Math.round((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 30;
    }).length;
    const recurringPoints = Math.max(5, 20 - Math.min(dueSoon, 5) * 3);

    return clamp(savingsPoints + disciplinePoints + debtPoints + consistencyPoints + recurringPoints, 0, 100);
  }, [summary.income, summary.expense, budgets, breakdownData, accounts, investments, emis, weeklyHeatmap, currentDate]);

  const healthTip = useMemo(() => {
    if (healthScore >= 80) return 'Keep it up—your savings and debt habits are strong.';
    if (healthScore >= 60) return 'Stay consistent with budgets and keep recurring bills under review.';
    return 'Focus on lowering discretionary spending and paying down debt over the next month.';
  }, [healthScore]);

  const exportRows = useMemo(() => {
    return filteredTransactions.map((tx) => ({
      Date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date),
      Type: tx.type,
      Category: tx.category,
      Account: tx.accountId,
      Amount: tx.amount,
      Description: tx.description || '',
    }));
  }, [filteredTransactions]);

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Account', 'Amount', 'Description'];
    const lines = [headers.join(','), ...exportRows.map((row) => headers.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pfos-report-${getMonthKey(selectedYear, selectedMonth)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const rows = [
      ['Date', 'Type', 'Category', 'Account', 'Amount', 'Description'],
      ...exportRows.map((row) => [row.Date, row.Type, row.Category, row.Account, row.Amount, row.Description]),
    ];
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><tbody>${rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pfos-report-${getMonthKey(selectedYear, selectedMonth)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const content = `
      <html><head><title>PFOS Report</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111;background:#fff;} .report-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;} .card{border:1px solid #e5e7eb;border-radius:18px;padding:16px;margin-bottom:16px;} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;}.metric{font-size:0.9rem;color:#6b7280;} .value{font-size:1.35rem;font-weight:700;margin-top:8px;}</style></head><body>
      <div class="report-header"><div><h1>PFOS Report</h1><p>${selectedMonthLabel} ${selectedYear}</p></div><div>${formatCurrency(summary.income)} income</div></div>
      <div class="grid"><div class="card"><strong>Total Income</strong><div class="value">${formatCurrency(summary.income)}</div></div><div class="card"><strong>Total Expense</strong><div class="value">${formatCurrency(summary.expense)}</div></div><div class="card"><strong>Savings</strong><div class="value">${formatCurrency(summary.savings)}</div></div><div class="card"><strong>Cash Flow</strong><div class="value">${formatCurrency(summary.cashFlow)}</div></div></div>
      <div class="card"><strong>Insights</strong><ul>${insights.map((insight) => `<li>${insight}</li>`).join('')}</ul></div>
      <div class="card"><strong>Transactions</strong><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th></tr></thead><tbody>${exportRows
        .map(
          (row) =>
            `<tr><td>${row.Date}</td><td>${row.Type}</td><td>${row.Category}</td><td>${row.Amount}</td></tr>`
        )
        .join('')}</tbody></table></div>
      </body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(content);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  const cardSummary = [
    {
      title: 'Total income',
      value: formatCurrency(summary.income),
      change: transactions.length ? `for ${selectedMonthLabel}` : undefined,
      trend: 'positive' as const,
      icon: <ArrowUpRight className="size-5" />,
    },
    {
      title: 'Total expense',
      value: formatCurrency(summary.expense),
      change: `vs ${selectedYear - 1}`,
      trend: 'negative' as const,
      icon: <ArrowDownRight className="size-5" />,
    },
    {
      title: 'Savings',
      value: formatCurrency(summary.savings),
      change: summary.savings >= 0 ? 'Positive cash flow' : 'Review spending',
      trend: summary.savings >= 0 ? 'positive' as const : 'negative' as const,
      icon: <ShieldCheck className="size-5" />,
    },
    {
      title: 'Cash flow',
      value: formatCurrency(summary.cashFlow),
      change: `${breakdownData.length} categories`,
      trend: summary.cashFlow >= 0 ? 'positive' as const : 'negative' as const,
      icon: <HeartPulse className="size-5" />,
    },
  ];

  const isFilteredMonthAll = selectedMonth === 'all';

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reports</p>
            <h1 className="text-3xl font-semibold text-foreground">Financial insights</h1>
            <p className="mt-1 text-sm text-muted-foreground">Android-style reports built from your live PFOS data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setFilterPanelOpen((open) => !open)}
            >
              <Filter className="size-4" />
              Filters
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" onClick={handleExportPDF}>
              <FileText className="size-4" />
              Export PDF
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleDownloadExcel}>
              <Download className="size-4" />
              Excel
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleDownloadCSV}>
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
          <div className="flex flex-wrap gap-3">
            <FilterSelect
              label="Month"
              value={String(selectedMonth)}
              options={monthOptions}
              onValueChange={(value) => setSelectedMonth(value === 'all' ? 'all' : Number(value))}
              id="reports-month"
            />
            <FilterSelect
              label="Year"
              value={String(selectedYear)}
              options={yearOptions}
              onValueChange={(value) => setSelectedYear(Number(value))}
              id="reports-year"
            />
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 border border-border/80 text-sm text-muted-foreground inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            <span>{isFilteredMonthAll ? 'Showing all months' : `${selectedMonthLabel} ${selectedYear}`}</span>
          </div>
        </div>
      </div>

      {filterPanelOpen ? (
        <div className="rounded-3xl border border-border/80 bg-muted/80 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-4">
            <FilterSelect
              label="Month"
              value={String(selectedMonth)}
              options={monthOptions}
              onValueChange={(value) => setSelectedMonth(value === 'all' ? 'all' : Number(value))}
              id="reports-filter-month"
            />
            <FilterSelect
              label="Year"
              value={String(selectedYear)}
              options={yearOptions}
              onValueChange={(value) => setSelectedYear(Number(value))}
              id="reports-filter-year"
            />
            <FilterSelect
              label="Account"
              value={selectedAccount}
              options={accountOptions}
              onValueChange={setSelectedAccount}
              id="reports-filter-account"
            />
            <FilterSelect
              label="Category"
              value={selectedCategory}
              options={categoryOptions}
              onValueChange={setSelectedCategory}
              id="reports-filter-category"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cardSummary.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            trend={item.trend}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <ChartCard
            title="Income vs Expense trend"
            description="Last six months of activity"
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 12, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Category spending"
            description="Expense breakdown by category"
          >
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPieChart>
                <Pie
                  data={breakdownData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${entry.category}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly savings trend" description="How your savings are moving">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={savingsTrend} margin={{ top: 16, right: 16, left: -6, bottom: 6 }}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="savings" stroke="#2563EB" fill="url(#savingsGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Weekly spending heatmap" description="Expense density by day">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyHeatmap} margin={{ top: 16, right: 16, left: -6, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                  {weeklyHeatmap.map((entry) => (
                    <Cell key={entry.day} fill={getHeatColor(entry.amount)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-4">
          <ChartCard title="Account balance distribution" description="Where your funds are parked">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={balanceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {balanceDistribution.map((entry, index) => (
                    <Cell key={`cell-account-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={40} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Financial health score</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    A live assessment based on savings, discipline and debt.
                  </CardDescription>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-muted p-4 text-center">
                <div
                  className="relative flex h-36 w-36 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#22c55e ${healthScore * 3.6}deg, #e5e7eb 0deg)`,
                  }}
                >
                  <div className="absolute inset-4 rounded-full bg-background shadow-inner" />
                  <div className="relative flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-semibold text-foreground">{healthScore}</span>
                    <span className="text-xs uppercase text-muted-foreground">Health score</span>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{healthTip}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Savings rate</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{Math.round((summary.savings / Math.max(summary.income, 1)) * 100)}%</p>
                </div>
                <div className="rounded-3xl border border-border p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Budget discipline</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{budgets.length ? `${Math.round(((budgets.length - budgets.filter((budget) => {
                    const spent = breakdownData.find((item) => item.category === budget.categoryName)?.value || 0;
                    return budget.monthlyLimit && spent > budget.monthlyLimit;
                  }).length) / budgets.length) * 100)}%` : '—'}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 pt-4">
              <span className="rounded-full bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                Recurring bills: {Math.min(emis.length, 99)} active
              </span>
              <span className="rounded-full bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                Debt load: {Math.round(clamp(accounts.reduce((sum, account) => sum + Math.max(0, -(account.balance || 0)), 0) / Math.max(accounts.reduce((sum, account) => sum + Math.max(0, account.balance || 0), 0) + 1, 1) * 100, 0, 100))}%
              </span>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle className="text-base font-semibold">Insights</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Actionable observations from your latest activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {insights.map((insight, index) => (
                <div key={`${insight}-${index}`} className="rounded-3xl border border-border/70 bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border/70 bg-muted p-6 text-center text-sm text-muted-foreground">Loading reports from Firestore…</div>
      ) : null}
    </div>
  );
}
