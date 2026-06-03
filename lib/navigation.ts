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
  Shield,
  Bell,
  CalendarDays,
  Sparkles,
  LucideIcon,
  FileText,
  Upload,
  CreditCard,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/analytics?tab=stats', label: 'Stats', icon: BarChart3, description: 'Monthly spending analytics' },
  { href: '/dashboard/budgets', label: 'Budgets', icon: PiggyBank, description: 'Track monthly budgets' },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat, description: 'Automate recurring finances' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard, description: 'Optimize subscriptions & costs' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'Smart financial alerts' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, description: 'Financial calendar & timeline' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Manage your accounts' },
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Lightweight financial summary' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/goal-planner', label: 'Goal Planner', icon: Sparkles, description: 'Forecast goals and scenarios' },
  { href: '/dashboard/wealth-planner', label: 'Wealth Planner', icon: Sparkles, description: 'Retirement, FIRE and long-term planning' },
  { href: '/dashboard/tax-center', label: 'Tax Center', icon: FileText, description: 'Tax planning and reports' },
  { href: '/dashboard/family', label: 'Family', icon: Handshake, description: 'Family & shared accounts' },
  { href: '/dashboard/wealth-inventory', label: 'Wealth Inventory', icon: FileText, description: 'Asset & Liability Register' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText, description: 'Bills, policies & vault' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/settlements', label: 'Settlements', icon: Handshake, description: 'View settlements' },
  { href: '/dashboard/import', label: 'Import Hub', icon: Upload, description: 'Ingest bank statements & CSVs' },
];

export const bottomNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Executive financial overview' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Portfolio snapshot' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: PieChart, description: 'Advanced analytics' },
];

export const sidebarNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Financial overview' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, description: 'Account overview' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: List, description: 'Daily transaction feed' },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat, description: 'Automate recurring finances' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard, description: 'Optimize subscriptions & costs' },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, description: 'Manage investments' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'Smart alerts' },
  { href: '/dashboard/trading-journal', label: 'Trading Journal', icon: BookOpen, description: 'Trading records' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, description: 'Savings goals' },
  { href: '/dashboard/goal-planner', label: 'Goal Planner', icon: Sparkles, description: 'Financial scenario simulator' },
  { href: '/dashboard/ai-coach', label: 'AI Coach', icon: Sparkles, description: 'Personalized financial coaching' },
  { href: '/dashboard/wealth-planner', label: 'Wealth Planner', icon: Sparkles, description: 'Retirement, FIRE and long-term planning' },
  { href: '/dashboard/tax-center', label: 'Tax Center', icon: FileText, description: 'Tax planning and reports' },
  { href: '/dashboard/emi', label: 'EMI', icon: DollarSign, description: 'Track EMIs' },
  { href: '/dashboard/documents', label: 'Document Vault', icon: FileText, description: 'Bills & policies' },
  { href: '/dashboard/policies', label: 'Policies', icon: FileCheck, description: 'Insurance policies' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: PieChart, description: 'Advanced analytics' },
  { href: '/dashboard/import', label: 'Import Hub', icon: Upload, description: 'Ingest statements & spreadsheets' },
];

export const analyticsNavItems: NavItem[] = [
  { href: '/dashboard/reports', label: 'Reports', icon: PieChart, description: 'Generate reports' },
  { href: '/dashboard/ai-coach', label: 'AI Coach', icon: Sparkles, description: 'Financial copilot and coaching' },
];

export const settingsNavItems: NavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'App settings' },
  { href: '/dashboard/security', label: 'Security', icon: Shield, description: 'App lock and privacy' },
];

export const allNavItems = [...mainNavItems, ...analyticsNavItems, ...settingsNavItems];
