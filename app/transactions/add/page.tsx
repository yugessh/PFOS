'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TransactionType, TransactionFormData } from '@/src/components/transactions/types';
import { TransactionTypeToggle } from '@/src/components/transactions/TransactionTypeToggle';
import { AmountInput } from '@/src/components/transactions/AmountInput';
import { CategorySelector } from '@/src/components/transactions/CategorySelector';
import { AccountSelector } from '@/src/components/transactions/AccountSelector';
import { NotesInput } from '@/src/components/transactions/NotesInput';
import { DatePicker } from '@/src/components/transactions/DatePicker';
import { getCategoriesByType, ACCOUNTS } from '@/src/components/transactions/mock-data';

export default function AddTransactionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    account: '',
    notes: '',
    date: new Date(),
  });

  const [toAccount, setToAccount] = useState<string>('');

  const categories = getCategoriesByType(formData.type);

  const handleSave = () => {
    if (!formData.amount || !formData.category || !formData.account) {
      alert('Please fill in all required fields');
      return;
    }

    const transactionData: TransactionFormData = {
      ...formData,
      toAccount: formData.type === 'transfer' ? toAccount : undefined,
    };

    console.log('Saving transaction:', transactionData);
    
    // TODO: Integrate with Firestore service when ready
    // For now, just log and redirect
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="size-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Transaction Type Toggle */}
        <TransactionTypeToggle
          value={formData.type}
          onChange={(type) => setFormData({ ...formData, type, category: '' })}
        />

        {/* Amount Input */}
        <AmountInput
          value={formData.amount}
          onChange={(amount) => setFormData({ ...formData, amount })}
        />

        {/* Category Selector */}
        {formData.type !== 'transfer' && (
          <CategorySelector
            categories={categories}
            selectedCategory={formData.category}
            onSelect={(categoryId) => setFormData({ ...formData, category: categoryId })}
          />
        )}

        {/* Account Selector */}
        {formData.type === 'transfer' ? (
          <>
            <AccountSelector
              accounts={ACCOUNTS}
              selectedAccount={formData.account}
              onSelect={(accountId) => setFormData({ ...formData, account: accountId })}
              label="From Account"
            />
            <AccountSelector
              accounts={ACCOUNTS.filter(acc => acc.id !== formData.account)}
              selectedAccount={toAccount}
              onSelect={(accountId) => setToAccount(accountId)}
              label="To Account"
            />
          </>
        ) : (
          <AccountSelector
            accounts={ACCOUNTS}
            selectedAccount={formData.account}
            onSelect={(accountId) => setFormData({ ...formData, account: accountId })}
          />
        )}

        {/* Date Picker */}
        <DatePicker
          value={formData.date}
          onChange={(date) => setFormData({ ...formData, date })}
        />

        {/* Notes Input */}
        <NotesInput
          value={formData.notes}
          onChange={(notes) => setFormData({ ...formData, notes })}
        />

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          Save Transaction
        </button>
      </div>
    </div>
  );
}
