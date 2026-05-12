'use client';

import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { useAuthContext } from '@/src/context/AuthContext';

export default function ProtectedDashboardExample() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName || user?.email || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This is a protected dashboard page. Only authenticated users can see this.
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
              $12,450.00
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              +2.5% from last month
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Monthly Savings
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              $1,250.00
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              On track for goals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Investment Returns
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              +8.2%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Year to date
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
