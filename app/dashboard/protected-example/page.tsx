'use client';

import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { useAuthContext } from '@/src/context/AuthContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useInvestments } from '@/src/hooks/useInvestments';
import { formatCurrencyCompact } from '@/src/lib/currency';

export default function ProtectedDashboardExample() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuthContext();
  const { getTotalBalance, loading: accountsLoading } = useAccounts();
  const { getTotals, loading: transactionsLoading } = useTransactions();
  const { getTotalStats, loading: investmentsLoading } = useInvestments();

  const totalBalance = getTotalBalance ? getTotalBalance() : 0;
  const totals = getTotals ? getTotals() : { income: 0, expenses: 0 };
  const investmentStats = getTotalStats ? getTotalStats() : { totalValue: 0, totalInvested: 0, totalReturn: 0 };

  const savings = Math.max((totals.income || 0) - (totals.expenses || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName || user?.email || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This is a protected dashboard page showing live account data.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{user?.uid}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name:</span>
              <p className="text-gray-900 dark:text-white">{user?.displayName || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified:</span>
              <p className="text-gray-900 dark:text-white">
                {user?.emailVerified ? '✅ Verified' : '❌ Not verified'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Photo URL:</span>
              <p className="text-gray-900 dark:text-white text-sm">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                ) : 'No profile picture'}
              </p>
            </div>
          </div>
        </div>

        {/* Protected Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Account Balance
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {accountsLoading ? 'Loading…' : formatCurrencyCompact(totalBalance)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {accountsLoading ? '' : 'Live balance across accounts'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Monthly Savings
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {transactionsLoading ? 'Loading…' : formatCurrencyCompact(savings)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {transactionsLoading ? '' : 'Income minus expenses (current month)'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Investment Returns
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {investmentsLoading ? 'Loading…' : `${formatCurrencyCompact(investmentStats.totalReturn)} (${investmentStats.totalInvested ? ((investmentStats.totalReturn / investmentStats.totalInvested) * 100).toFixed(1) + '%' : '—'})`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {investmentsLoading ? '' : 'Net return across investments'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Transaction
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Set Savings Goal
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              View Reports
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
