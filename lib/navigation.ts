import {
  Home,
  Wallet,
  FileText,
  TrendingUp,
  Target,
  DollarSign,
  FileCheck,
  Handshake,
  BarChart3,
  PieChart,
  BookOpen,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'View your financial overview' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Manage your accounts' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: FileText, description: 'View transactions' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/settlements', label: 'Settlements', icon: Handshake, description: 'View settlements' },
];

export const analyticsNavItems: NavItem[] = [
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, description: 'Financial analytics' },
  { href: '/dashboard/reports', label: 'Reports', icon: PieChart, description: 'Generate reports' },
  { href: '/dashboard/trading-journal', label: 'Trading Journal', icon: BookOpen, description: 'Trading records' },
];

export const settingsNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'App settings' },
];

export const allNavItems = [...mainNavItems, ...analyticsNavItems, ...settingsNavItems];
