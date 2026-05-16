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
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'Smart financial alerts' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Manage your accounts' },
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Lightweight financial summary' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/settlements', label: 'Settlements', icon: Handshake, description: 'View settlements' },
];

export const bottomNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home, description: 'Lightweight financial summary' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Manage your accounts' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'Smart financial alerts' },
];

export const sidebarNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Financial overview' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Account overview' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat, description: 'Automate recurring finances' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'Smart alerts' },
  { href: '/dashboard/trading-journal', label: 'Trading Journal', icon: BookOpen, description: 'Trading records' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: PieChart, description: 'Advanced analytics' },
];

export const analyticsNavItems: NavItem[] = [
  { href: '/dashboard/reports', label: 'Reports', icon: PieChart, description: 'Generate reports' },
];

export const settingsNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'App settings' },
];

export const allNavItems = [...mainNavItems, ...analyticsNavItems, ...settingsNavItems];
