# PFOS Dashboard Components

## Overview

The PFOS (Personal Finance Operating System) dashboard is built with reusable, modular React components using TypeScript, Tailwind CSS, and Recharts for data visualization.

## Core Components

### Layout Components

#### `StatCard`
Summary statistics card with optional change indicators.

**Props:**
- `label: string` - Card title/label
- `value: string | number` - Main value to display
- `change?: number` - Percentage change (positive/negative)
- `changeLabel?: string` - Text description of change
- `icon?: React.ReactNode` - Icon to display
- `variant?: 'default' | 'success' | 'danger'` - Card styling variant
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<StatCard
  label="Monthly Income"
  value="₹150K"
  icon={<TrendingUp />}
  change={8}
  changeLabel="increase"
/>
```

#### `ChartCard`
Wrapper component for chart visualizations with consistent styling.

**Props:**
- `title: string` - Chart title
- `description?: string` - Optional subtitle
- `children: React.ReactNode` - Chart content
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<ChartCard title="Expense Breakdown">
  <ResponsiveContainer>
    <PieChart data={data} />
  </ResponsiveContainer>
</ChartCard>
```

### Financial Summary Components

#### `NetWorthCard`
Displays overall net worth with asset breakdown.

**Props:**
- `accounts: Account[]` - User accounts
- `investments: Investment[]` - User investments

**Features:**
- Total net worth calculation
- Assets breakdown
- Investment returns display
- Gradient background design

#### `IncomeExpenseChart`
Bar chart comparing monthly income vs expenses.

**Props:**
- `data: MonthlyData[]` - Array with month, income, spending

**Features:**
- Side-by-side bar comparison
- Interactive tooltips
- Responsive container
- Color-coded bars (green income, red expenses)

#### `InvestmentAllocationChart`
Pie chart showing portfolio allocation by investment.

**Props:**
- `investments: Investment[]` - Investment portfolio

**Features:**
- Percentage breakdown
- Color-coded segments
- Investment names and values
- Interactive legend

#### `ExpensePieChart`
Pie chart breaking down expenses by category.

**Props:**
- `data: ExpenseData[]` - Categories with values

**Features:**
- Category percentages
- Color-coded segments
- Tooltip with currency formatting
- Category labels

### Card Components

#### `GoalCard`
Displays savings goal with progress tracking.

**Props:**
- `goal: SavingsGoal` - Goal data

**Features:**
- Progress bar
- Current vs target amounts
- Days remaining countdown
- Category badge

#### `ReminderCard`
Shows upcoming reminders and payment due dates.

**Props:**
- `reminder: Reminder` - Reminder data

**Features:**
- Status indicators (urgent, overdue, upcoming)
- Category tags
- Due date countdown
- Color-coded urgency

#### `EMIProgressCard`
Tracks loan EMI payment progress.

**Props:**
- `emi: EMI` - EMI data

**Features:**
- Monthly payment display
- Progress bar
- Remaining balance
- Months remaining

### Data Display Components

#### `RecentTransactionsTable`
Lists recent transactions with filtering options.

**Props:**
- `transactions: Transaction[]` - Transaction data
- `limit?: number` - Number of transactions to show (default: 5)

**Features:**
- Transaction icons (income/expense)
- Category display
- Amount formatting
- Date information
- Empty state handling

#### `QuickActionsPanel`
Quick action buttons for common operations.

**Features:**
- Add Transaction
- Transfer Money
- Download Report
- Settings
- Icon-based design
- Hover effects

## Demo Data

The dashboard includes comprehensive demo data in `lib/demo-data.ts`:

- **Accounts**: 3 sample accounts (savings, checking, investment)
- **Transactions**: 10+ sample transactions with various categories
- **Savings Goals**: 4 goals with progress tracking
- **EMIs**: 3 loan EMIs with payment schedules
- **Investments**: 4 investments (mutual funds, stocks, fixed deposits)
- **Reminders**: 4 upcoming reminders and payments
- **Monthly Data**: 5 months of spending/income data
- **Expense Breakdown**: 6 expense categories with percentages

## Data Types

All components use TypeScript interfaces from `lib/types.ts`:

```typescript
interface Account {
  id: string;
  name: string;
  type: 'savings' | 'checking' | 'credit' | 'investment';
  balance: number;
  icon: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: Date;
  account: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
}

interface EMI {
  id: string;
  name: string;
  principalAmount: number;
  monthlyPayment: number;
  remainingAmount: number;
  rateOfInterest: number;
  startDate: Date;
  endDate: Date;
  monthsRemaining: number;
}

interface Investment {
  id: string;
  name: string;
  type: 'mutual-fund' | 'stock' | 'crypto' | 'fixed-deposit';
  currentValue: number;
  investedAmount: number;
  returns: number;
  returnPercentage: number;
  date: Date;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  category: string;
}
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **Design tokens** from `globals.css` for consistent colors
- **Responsive grid layouts** for mobile/tablet/desktop
- **Recharts** for interactive visualizations

### Color Scheme

- **Primary**: Blue (`#0ea5e9`) - Main actions
- **Success**: Green (`#10b981`) - Income/gains
- **Danger**: Red (`#ef4444`) - Expenses/losses
- **Warning**: Amber (`#f59e0b`) - Urgent items
- **Background**: Light (`#f9fafb`) - Card backgrounds
- **Borders**: Gray (`#e5e7eb`) - Component dividers

## Architecture

The dashboard is built with:

1. **Modular Components** - Each component has a single responsibility
2. **TypeScript** - Full type safety
3. **Client Components** - All marked with `'use client'`
4. **Responsive Design** - Mobile-first approach
5. **Demo Data** - Realistic financial data for testing
6. **Recharts** - Professional charts with animations

## Usage Example

```tsx
import { NetWorthCard } from '@/components/net-worth-card';
import { IncomeExpenseChart } from '@/components/income-expense-chart';
import { GoalCard } from '@/components/goal-card';
import { accounts, investments, savingsGoals, monthlySpending } from '@/lib/demo-data';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <NetWorthCard accounts={accounts} investments={investments} />
      <IncomeExpenseChart data={monthlySpending} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {savingsGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
}
```

## Extending the Dashboard

To add new features:

1. Create a new component in `/components`
2. Define TypeScript interfaces for props
3. Use existing design tokens for styling
4. Add demo data to `lib/demo-data.ts`
5. Import and use in dashboard page

All components follow the same patterns for consistency and maintainability.
