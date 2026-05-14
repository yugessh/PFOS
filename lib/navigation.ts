import {
  Home,
  List,
  Wallet,
  PiggyBank,
  TrendingUp,
  Repeat,
  Target,
  DollarSign,
  FileCheck,
  Handshake,
  BarChart3,
  PieChart,
  BookOpen,
  Settings,
  Bell,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/stats', label: 'Stats', icon: BarChart3, description: 'Monthly spending analytics' },
  { href: '/dashboard/budgets', label: 'Budgets', icon: PiggyBank, description: 'Track monthly budgets' },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat, description: 'Automate recurring finances' },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell, description: 'Bill and payment reminders' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Manage your accounts' },
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Lightweight financial summary' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/settlements', label: 'Settlements', icon: Handshake, description: 'View settlements' },
];

export const analyticsNavItems: NavItem[] = [
  { href: '/dashboard/stats', label: 'Stats', icon: BarChart3, description: 'Monthly analytics' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: PieChart, description: 'Legacy analytics route' },
  { href: '/dashboard/reports', label: 'Reports', icon: PieChart, description: 'Generate reports' },
  { href: '/dashboard/trading-journal', label: 'Trading Journal', icon: BookOpen, description: 'Trading records' },
];

export const settingsNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'App settings' },
];

export const allNavItems = [...mainNavItems, ...analyticsNavItems, ...settingsNavItems];
