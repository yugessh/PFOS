'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { accounts, transactions, reminders, emis, monthlySpending } from '@/data';
import { Wallet, TrendingUp, CreditCard, Plus, AlertCircle, PiggyBank } from 'lucide-react';

export default function Dashboard() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  // Calculate summary metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentMonthSpending = monthlySpending[monthlySpending.length - 1]?.spending || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Get upcoming reminders and EMI (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingReminders = reminders.filter(r => {
    const reminderDate = new Date(r.reminderDate);
    return reminderDate >= today && reminderDate <= nextWeek;
  }).slice(0, 3);

  const upcomingEMI = emis.filter(e => {
    const emiDate = new Date(e.nextDueDate);
    return emiDate >= today && emiDate <= nextWeek;
  }).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h1 className="text-3xl font-bold">₹{(totalBalance / 100000).toFixed(2)}L</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={() => setAddTransactionOpen(true)}
          >
            <Plus className="size-5" />
            Add
          </Button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-green-300" />
              <p className="text-blue-100 text-xs">Income</p>
            </div>
            <p className="text-lg font-semibold">₹{(totalIncome / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="size-4 text-red-300" />
              <p className="text-blue-100 text-xs">Expenses</p>
            </div>
            <p className="text-lg font-semibold">₹{(totalExpenses / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Savings Insight Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="size-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Savings Rate</h2>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{savingsRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of income saved</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ₹{((totalIncome - totalExpenses) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">saved this month</p>
            </div>
          </div>
        </div>

        {/* Upcoming Alerts */}
        {(upcomingReminders.length > 0 || upcomingEMI.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="size-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming</h2>
            </div>
            <div className="space-y-2">
              {upcomingReminders.slice(0, 2).map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{reminder.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(reminder.reminderDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full">
                    Reminder
                  </span>
                </div>
              ))}
              {upcomingEMI.slice(0, 1).map((emi) => (
                <div key={emi.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{emi.loanName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(emi.nextDueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">
                    ₹{emi.monthlyEmi.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
              See All
            </Button>
          </div>
          <RecentTransactionsTable transactions={transactions} limit={5} />
        </div>
      </div>

      <AddTransactionModal open={addTransactionOpen} onOpenChange={setAddTransactionOpen} />
    </div>
  );
}
