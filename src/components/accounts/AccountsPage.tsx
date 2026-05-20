'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightLeft, Filter, Plus, Search, Trash2, PencilLine, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddAccountModal } from './AddAccountModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { EmptyAccountsState } from './EmptyAccountsState';
import { TransferModal } from './TransferModal';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { formatDate } from '@/lib/date';
import { getAccountTypeLabel, getAccountTypeMeta } from '@/src/lib/account-types';
import type { Account } from '@/src/services/firestore/accounts.service';

type AccountFilter = 'all' | 'bank_account' | 'cash' | 'upi_wallet' | 'investment_account' | 'crypto_wallet' | 'custom_account';

const accountFilterOptions: { value: AccountFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'bank_account', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi_wallet', label: 'UPI' },
  { value: 'investment_account', label: 'Investment' },
  { value: 'crypto_wallet', label: 'Crypto' },
  { value: 'custom_account', label: 'Custom' },
];

function round(amount: number) {
  return Math.round(amount * 100) / 100;
}

function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function accountCurrency(account: Account | undefined) {
  return (account?.currency || 'INR') as any;
}

function formatSignedCurrency(amount: number, currency: string) {
  return `${amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(amount), currency as any)}`;
}

function getTransferLabel(tx: any) {
  const from = tx.accountName || tx.account || 'Account';
  const to = tx.toAccountName || tx.toAccount || 'Account';
  return `${from} → ${to}`;
}

export function AccountsPage() {
  const { accounts, loading, error, addAccount, updateAccount, removeAccount, refresh } = useAccounts();
  const { transactions, refresh: refreshTransactions } = useTransactions();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AccountFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [transferAccount, setTransferAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeAccounts = useMemo(() => accounts.filter((account) => account.deletedAt == null && account.isActive !== false), [accounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeAccounts.filter((account) => {
      const accountType = account.accountType || account.type || 'bank_account';
      const label = getAccountTypeLabel(accountType).toLowerCase();
      const name = (account.name || account.accountName || '').toLowerCase();
      const matchesQuery = !query || name.includes(query) || label.includes(query) || accountType.includes(query);
      const matchesType = filter === 'all' || accountType === filter;
      return matchesQuery && matchesType;
    });
  }, [activeAccounts, filter, search]);

  const totalBalance = useMemo(
    () => round(activeAccounts.reduce((sum, account) => sum + Number(account.currentBalance ?? account.balance ?? 0), 0)),
    [activeAccounts]
  );

  const monthlyInflow = useMemo(
    () => round(activeAccounts.reduce((sum, account) => sum + Number(account.monthlyInflow ?? 0), 0)),
    [activeAccounts]
  );

  const monthlyOutflow = useMemo(
    () => round(activeAccounts.reduce((sum, account) => sum + Number(account.monthlyOutflow ?? 0), 0)),
    [activeAccounts]
  );

  const currentMonthRange = useMemo(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }, []);

  const recentActivity = useMemo(() => {
    const accountIds = new Set(activeAccounts.map((account) => account.id));
    return [...transactions]
      .filter((tx: any) => accountIds.has(tx.account) || accountIds.has(tx.toAccount))
      .filter((tx: any) => {
        const date = toDate(tx.date);
        return date >= currentMonthRange.start && date <= currentMonthRange.end;
      })
      .sort((a: any, b: any) => toDate(b.date).getTime() - toDate(a.date).getTime())
      .slice(0, 8);
  }, [activeAccounts, currentMonthRange.end, currentMonthRange.start, transactions]);

  const activityRows = useMemo(() => {
    return recentActivity.map((tx: any) => {
      const account = activeAccounts.find((item) => item.id === tx.account);
      const destination = activeAccounts.find((item) => item.id === tx.toAccount);
      const currency = accountCurrency(account);

      if (tx.type === 'transfer') {
        return {
          id: tx.id,
          title: getTransferLabel({ ...tx, accountName: account?.name, toAccountName: destination?.name }),
          subtitle: tx.notes || 'Transfer',
          amount: tx.amount,
          sign: -1,
          date: toDate(tx.date),
          icon: '↔️',
          color: 'text-[#7EE7C7]',
          currency,
        };
      }

      const isIncome = tx.type === 'income';
      return {
        id: tx.id,
        title: tx.description || tx.category || 'Transaction',
        subtitle: account?.name || 'Account',
        amount: tx.amount,
        sign: isIncome ? 1 : -1,
        date: toDate(tx.date),
        icon: isIncome ? '↗️' : '↘️',
        color: isIncome ? 'text-[#7EE7C7]' : 'text-[#FF8C8C]',
        currency,
      };
    });
  }, [activeAccounts, recentActivity]);

  async function handleSaveAccount(accountData: Partial<Account>) {
    if (editAccount?.id) {
      await updateAccount(editAccount.id, accountData);
    } else {
      await addAccount(accountData);
    }
    await refresh();
    await refreshTransactions();
  }

  async function handleDeleteAccount() {
    if (!deleteAccount) return;
    setDeleting(true);
    try {
      await removeAccount(deleteAccount.id);
      await refreshTransactions();
      setDeleteAccount(null);
    } catch (err) {
      throw err;
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-main px-4 pb-28 pt-4 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-[linear-gradient(160deg,rgba(21,26,32,0.98),rgba(14,17,23,0.92))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,231,199,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(126,231,199,0.1),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7EE7C7]/20 bg-[#7EE7C7]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B9F5D8]">
                <Wallet className="size-4" />
                Accounts
              </div>
              <div>
                <p className="text-sm text-white/60">Total Balance</p>
                <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {formatCurrency(totalBalance, (activeAccounts[0]?.currency || 'INR') as any)}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                  Manage every money source in one dark, mint-accented operating system. Move money between accounts, track inflow and outflow, and keep the ledger synchronized.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:max-w-4xl">
              {[
                { label: 'Total Balance', value: formatCurrencyCompact(totalBalance, (activeAccounts[0]?.currency || 'INR') as any), icon: Wallet },
                { label: 'Monthly Inflow', value: formatCurrencyCompact(monthlyInflow, (activeAccounts[0]?.currency || 'INR') as any), icon: ArrowUpRight },
                { label: 'Monthly Outflow', value: formatCurrencyCompact(monthlyOutflow, (activeAccounts[0]?.currency || 'INR') as any), icon: ArrowDownLeft },
                { label: 'Accounts', value: String(activeAccounts.length).padStart(2, '0'), icon: Filter },
              ].map((item) => (
                <motion.article
                  key={item.label}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-[28px] border border-border/60 bg-card/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                    <item.icon className="size-4 text-[#7EE7C7]" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border/60 bg-card/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Search & Filter</h2>
              <p className="text-sm text-white/50">Find accounts by name or money source type.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[320px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accounts"
                  className="pl-11"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {accountFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      filter === option.value
                        ? 'bg-[#7EE7C7] text-[#04140F] shadow-[0_14px_32px_rgba(126,231,199,0.28)]'
                        : 'border border-border/60 bg-card-elevated text-white/70 hover:border-[#7EE7C7]/40 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Accounts</h2>
              <p className="text-sm text-white/50">Horizontal rail with live balances and account-level flow stats.</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" onClick={() => setTransferAccount(filteredAccounts[0] || activeAccounts[0] || null)} disabled={activeAccounts.length < 2}>
                <ArrowRightLeft className="size-4" />
                Transfer
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Add Account
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-border/60 bg-card/90 p-8 text-center text-sm text-white/55">
              Loading accounts...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <EmptyAccountsState onAddAccount={() => setAddOpen(true)} />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              <AnimatePresence initial={false}>
                {filteredAccounts.map((account, index) => {
                  const accountType = account.accountType || account.type || 'bank_account';
                  const meta = getAccountTypeMeta(accountType);
                  const balance = Number(account.currentBalance ?? account.balance ?? 0);

                  return (
                    <motion.article
                      key={account.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group min-w-[280px] snap-start rounded-[32px] border border-border/60 bg-[linear-gradient(180deg,rgba(21,26,32,0.98),rgba(11,14,19,0.96))] p-5 shadow-[0_18px_52px_rgba(0,0,0,0.32)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-14 items-center justify-center rounded-[22px] text-2xl shadow-[0_16px_32px_rgba(0,0,0,0.25)]"
                            style={{ backgroundColor: `${account.color || '#7EE7C7'}22`, color: account.color || '#7EE7C7' }}
                          >
                            {account.icon || meta.icon}
                          </div>
                          <div>
                            <p className="text-lg font-semibold tracking-tight text-white">{account.name || account.accountName}</p>
                            <p className="text-sm text-white/50">{meta.label}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-[#7EE7C7]/20 bg-[#7EE7C7]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B9F5D8]">
                          {account.currency || 'INR'}
                        </span>
                      </div>

                      <div className="mt-6 space-y-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Current balance</p>
                        <p className="text-3xl font-semibold tracking-tight text-white">{formatCurrency(balance, account.currency as any)}</p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-[24px] border border-[#7EE7C7]/15 bg-[#7EE7C7]/8 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[#B9F5D8]">Inflow</p>
                          <p className="mt-1 text-base font-semibold text-white">{formatSignedCurrency(Number(account.monthlyInflow ?? 0), account.currency || 'INR')}</p>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Outflow</p>
                          <p className="mt-1 text-base font-semibold text-white">{formatSignedCurrency(-Number(account.monthlyOutflow ?? 0), account.currency || 'INR')}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[24px] border border-border/60 bg-card-elevated/75 px-4 py-3 text-sm text-white/65">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Latest activity</p>
                        <p className="mt-1 font-medium text-white">{account.lastTransaction || 'No activity yet'}</p>
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setTransferAccount(account)} disabled={activeAccounts.length < 2}>
                          <ArrowRightLeft className="size-4" />
                          Transfer
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditAccount(account)}
                          className="rounded-full border border-border/60 bg-card-elevated text-white hover:text-[#7EE7C7]"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteAccount(account)}
                          className="rounded-full border border-border/60 bg-card-elevated text-white hover:text-[#FF8C8C]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-border/60 bg-card/90 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Recent account activity</h2>
                <p className="text-sm text-white/50">Transfers automatically appear in the transaction history.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTransferAccount(filteredAccounts[0] || activeAccounts[0] || null)} disabled={activeAccounts.length < 2}>
                <ArrowRightLeft className="size-4" />
                New Transfer
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {activityRows.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/60 bg-card-elevated/60 p-6 text-sm text-white/50">
                  No account activity yet.
                </div>
              ) : (
                activityRows.map((item) => (
                  <motion.article
                    key={item.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-card-elevated/70 px-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex size-11 items-center justify-center rounded-[18px] border border-border/60 bg-black/15 ${item.color}`}>
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{item.title}</p>
                        <p className="truncate text-sm text-white/50">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${item.sign >= 0 ? 'text-[#7EE7C7]' : 'text-[#FF8C8C]'}`}>
                        {formatSignedCurrency(item.sign * item.amount, item.currency)}
                      </p>
                      <p className="text-xs text-white/40">{formatDate(item.date)}</p>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-border/60 bg-card/90 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
              <h3 className="text-lg font-semibold tracking-tight">Quick actions</h3>
              <div className="mt-4 space-y-3">
                <Button className="w-full justify-start" onClick={() => setAddOpen(true)}>
                  <Plus className="size-4" />
                  Add Account
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setTransferAccount(filteredAccounts[0] || activeAccounts[0] || null)} disabled={activeAccounts.length < 2}>
                  <ArrowRightLeft className="size-4" />
                  Transfer Money
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-card/90 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
              <h3 className="text-lg font-semibold tracking-tight">Account types</h3>
              <div className="mt-4 space-y-3">
                {Object.entries(
                  activeAccounts.reduce<Record<string, number>>((accumulator, account) => {
                    const accountType = account.accountType || account.type || 'bank_account';
                    accumulator[accountType] = (accumulator[accountType] || 0) + 1;
                    return accumulator;
                  }, {})
                ).length === 0 ? (
                  <p className="text-sm text-white/50">Add accounts to see type distribution.</p>
                ) : (
                  Object.entries(
                    activeAccounts.reduce<Record<string, number>>((accumulator, account) => {
                      const accountType = account.accountType || account.type || 'bank_account';
                      accumulator[accountType] = (accumulator[accountType] || 0) + 1;
                      return accumulator;
                    }, {})
                  ).map(([type, count]) => {
                    const meta = getAccountTypeMeta(type);
                    return (
                      <div key={type} className="flex items-center justify-between rounded-[22px] border border-border/60 bg-card-elevated/70 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-[16px] bg-[#7EE7C7]/10 text-lg">{meta.icon}</span>
                          <div>
                            <p className="font-medium text-white">{meta.label}</p>
                            <p className="text-xs text-white/45">{count} account{count > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#7EE7C7]">{count.toString().padStart(2, '0')}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 sm:hidden">
        <Button
          size="icon-lg"
          className="rounded-full bg-[#7EE7C7] text-[#04140F] shadow-[0_18px_42px_rgba(126,231,199,0.28)] hover:bg-[#90ead1]"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-5" />
        </Button>
        <Button
          size="icon-lg"
          variant="outline"
          className="rounded-full border-[#7EE7C7]/25 bg-card-elevated text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)]"
          onClick={() => setTransferAccount(filteredAccounts[0] || activeAccounts[0] || null)}
          disabled={activeAccounts.length < 2}
        >
          <ArrowRightLeft className="size-5" />
        </Button>
      </div>

      <AddAccountModal
        open={addOpen || editAccount != null}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditAccount(null);
          }
        }}
        account={editAccount}
        mode={editAccount ? 'edit' : 'add'}
        onSave={handleSaveAccount}
      />

      <TransferModal
        open={transferAccount != null}
        onOpenChange={(open) => {
          if (!open) setTransferAccount(null);
        }}
        defaultFromAccountId={transferAccount?.id}
        onSuccess={async () => {
          await refresh();
          await refreshTransactions();
          setTransferAccount(null);
        }}
      />

      <DeleteAccountModal
        open={deleteAccount != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteAccount(null);
        }}
        account={deleteAccount}
        deleting={deleting}
        onDelete={handleDeleteAccount}
      />

      {error ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#FF6B6B]/30 bg-[#1A1010]/95 px-5 py-3 text-sm text-[#FFB1B1] shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
          {error}
        </div>
      ) : null}
    </motion.main>
  );
}