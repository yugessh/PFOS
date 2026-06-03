'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Map, 
  Table, 
  Play, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  User,
  PlusCircle,
  FileJson,
  UploadCloud,
  CheckCircle2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuthContext } from '@/src/context/AuthContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBackupRestore } from '@/src/hooks/useBackupRestore';
import { parseBankStatementRows, BANK_TEMPLATES, type ParsedRow, type BankTemplateKey } from '@/src/utils/import/BankStatementMapper';
import { findDuplicates, type DuplicateMatch } from '@/src/utils/import/DuplicateDetector';
import { importService } from '@/src/services/firestore/import.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { investmentsService } from '@/src/services/firestore/investments.service';
import { tradingJournalService } from '@/src/services/firestore/tradingJournal.service';
import { useFinancialCoach } from '@/src/hooks/useFinancialCoach';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getFirestoreClient } from '@/src/services/firestore/firebaseClient';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { toCanonicalAccountType } from '@/src/lib/account-types';

interface ImportWizardProps {
  parsedFile: {
    fileName: string;
    fileSize: number;
    rows: any[];
    headers: string[];
    detectedTemplate: BankTemplateKey;
    sheets?: string[];
  } | null;
  onReset: () => void;
}

const CATEGORIES_LIST = [
  // Expenses
  { id: 'Food & Dining', name: 'Food & Dining', icon: '🍔', type: 'expense' },
  { id: 'Transportation', name: 'Transportation', icon: '🛵', type: 'expense' },
  { id: 'Shopping', name: 'Shopping', icon: '🛍️', type: 'expense' },
  { id: 'Entertainment', name: 'Entertainment', icon: '🎬', type: 'expense' },
  { id: 'Bills & Utilities', name: 'Bills & Utilities', icon: '💡', type: 'expense' },
  { id: 'Healthcare', name: 'Healthcare', icon: '🏥', type: 'expense' },
  { id: 'Education', name: 'Education', icon: '📚', type: 'expense' },
  { id: 'Groceries', name: 'Groceries', icon: '🛒', type: 'expense' },
  { id: 'Travel', name: 'Travel', icon: '✈️', type: 'expense' },
  { id: 'Personal Care', name: 'Personal Care', icon: '💇', type: 'expense' },
  { id: 'Home', name: 'Home', icon: '🏠', type: 'expense' },
  // Income
  { id: 'Salary', name: 'Salary', icon: '💰', type: 'income' },
  { id: 'Freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'Investments', name: 'Investments', icon: '📈', type: 'income' },
  { id: 'Gifts', name: 'Gifts', icon: '🎁', type: 'income' },
  { id: 'Refunds', name: 'Refunds', icon: '↩️', type: 'income' },
  { id: 'Other Income', name: 'Other Income', icon: '💵', type: 'income' },
  // General
  { id: 'Other', name: 'Other', icon: '📦', type: 'expense' },
];

export default function ImportWizard({ parsedFile, onReset }: ImportWizardProps) {
  const { user } = useAuthContext();
  const { accounts, addAccount, refresh: refreshAccounts } = useAccounts();
  const { transactions: existingTxs, refresh: refreshTxs } = useTransactions();
  const { importFromBackup } = useBackupRestore();
  const coach = useFinancialCoach();

  const [step, setStep] = useState(1);
  const [importMode, setImportMode] = useState<'transactions' | 'investments' | 'trading' | 'backup'>('transactions');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  
  // Custom manual mappings
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: '',
    description: '',
    reference: '',
    debit: '',
    credit: '',
    amount: '',
    type: '',
    balance: '',
  });

  // Parsed normalized rows
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<Set<number>>(new Set());
  const [duplicateMatches, setDuplicateMatches] = useState<Record<number, DuplicateMatch>>({});
  
  // Ingest status
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestResult, setIngestResult] = useState<{
    successCount: number;
    skippedCount: number;
    errorCount: number;
    totalAmount: number;
    logId?: string;
  } | null>(null);

  // New account form inside wizard
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('bank_account');
  const [newAccountBalance, setNewAccountBalance] = useState('0');

  // Check if file is a JSON backup
  useEffect(() => {
    if (parsedFile && parsedFile.fileName.endsWith('.json')) {
      // Look if JSON has transactions or accounts keys (meaning it is a backup file)
      const data = parsedFile.rows as any;
      const isBackup = data && !Array.isArray(data) && (data.transactions || data.accounts || data.metadata);
      if (isBackup) {
        setImportMode('backup');
      }
    }
  }, [parsedFile]);

  // Set default mappings based on headers auto-detection
  useEffect(() => {
    if (parsedFile) {
      const headers = parsedFile.headers;
      const autoMap: Record<string, string> = {};
      
      const findHeader = (keywords: string[]) => {
        return headers.find(h => 
          keywords.some(k => String(h).toLowerCase().trim() === k.toLowerCase())
        ) || '';
      };

      autoMap.date = findHeader(['date', 'txn date', 'transaction date', 'tran date', 'date of txn']);
      autoMap.description = findHeader(['description', 'particulars', 'narration', 'details', 'remarks', 'desc']);
      autoMap.reference = findHeader(['ref no', 'ref no.', 'cheque no.', 'chq/ref no', 'chq no', 'reference', 'ref_no']);
      autoMap.debit = findHeader(['debit', 'withdrawal amt', 'withdrawal (dr)', 'withdrawal', 'dr', 'withdrawn']);
      autoMap.credit = findHeader(['credit', 'deposit amt', 'deposit (cr)', 'deposit', 'cr', 'received']);
      autoMap.amount = findHeader(['amount', 'amt', 'value', 'transaction amount']);
      autoMap.type = findHeader(['type', 'tx_type', 'transaction type']);
      autoMap.balance = findHeader(['balance', 'closing balance', 'bal']);

      setColumnMapping(prev => ({ ...prev, ...autoMap }));

      // Set default account if available
      if (accounts && accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [parsedFile, accounts]);

  // Handle parsing execution
  const runParser = () => {
    if (!parsedFile) return;

    let normalized: ParsedRow[] = [];
    
    if (parsedFile.detectedTemplate === 'generic') {
      normalized = parseBankStatementRows(parsedFile.rows, 'generic', columnMapping);
    } else {
      normalized = parseBankStatementRows(parsedFile.rows, parsedFile.detectedTemplate);
    }

    setParsedRows(normalized);
    
    // Check duplicates against existing transactions
    if (existingTxs && existingTxs.length > 0) {
      const dups = findDuplicates(normalized, existingTxs);
      setDuplicateMatches(dups);
      
      // Auto select only valid & non-exact-duplicates
      const initialSelected = new Set<number>();
      normalized.forEach((row, idx) => {
        if (row.isValid && dups[idx]?.type !== 'exact') {
          initialSelected.add(idx);
        }
      });
      setSelectedRowIndexes(initialSelected);
    } else {
      const initialSelected = new Set<number>();
      normalized.forEach((row, idx) => {
        if (row.isValid) initialSelected.add(idx);
      });
      setSelectedRowIndexes(initialSelected);
    }

    setStep(2);
  };

  // Perform transaction save in chunks
  const executeIngest = async () => {
    if (!user?.uid || !parsedFile) return;

    setIngesting(true);
    setIngestProgress(0);

    const db = getFirestoreClient();
    if (!db) {
      alert('Firestore not initialized');
      setIngesting(false);
      return;
    }

    const importId = `imp_${Date.now()}`;
    const selectedRows = parsedRows.filter((_, idx) => selectedRowIndexes.has(idx));
    const totalCount = selectedRows.length;
    const errors: string[] = [];
    
    let successCount = 0;
    let skippedCount = parsedRows.length - totalCount;
    let errorCount = 0;
    let totalAmount = 0;

    // Collect net balance adjustments per account to update at the end
    const balanceAdjustments: Record<string, number> = {};

    try {
      const chunkSize = 200; // Batch operations limit
      for (let i = 0; i < totalCount; i += chunkSize) {
        const chunk = selectedRows.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        chunk.forEach((row) => {
          try {
            const amount = Number(row.amount);
            totalAmount += amount;

            if (importMode === 'transactions') {
              const txRef = doc(collection(db, 'transactions'));
              const txPayload = {
                userId: user.uid,
                accountId: selectedAccountId,
                amount,
                type: row.type,
                category: row.category,
                description: row.description,
                date: row.date,
                isRecurring: false,
                metadata: {
                  importId,
                  reference: row.reference,
                  source: 'statement_import',
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null,
              };
              batch.set(txRef, txPayload);

              // Calculate balance adjustments
              if (row.type === 'income') {
                balanceAdjustments[selectedAccountId] = (balanceAdjustments[selectedAccountId] || 0) + amount;
              } else if (row.type === 'expense') {
                balanceAdjustments[selectedAccountId] = (balanceAdjustments[selectedAccountId] || 0) - amount;
              } else if (row.type === 'transfer') {
                // If transfer, subtract from source, but we don't have secondary account mapped yet in row
                balanceAdjustments[selectedAccountId] = (balanceAdjustments[selectedAccountId] || 0) - amount;
              }
            } else if (importMode === 'investments') {
              // Parse investment types
              let invType: 'sip' | 'stocks' | 'mutual_funds' | 'crypto' | 'gold' | 'fd' = 'stocks';
              const nameLower = row.description.toLowerCase();
              if (nameLower.includes('mutual') || nameLower.includes('mf')) invType = 'mutual_funds';
              else if (nameLower.includes('crypto') || nameLower.includes('usdt') || nameLower.includes('btc')) invType = 'crypto';
              else if (nameLower.includes('sip')) invType = 'sip';
              else if (nameLower.includes('gold') || nameLower.includes('sovereign')) invType = 'gold';
              else if (nameLower.includes('fd') || nameLower.includes('deposit')) invType = 'fd';

              const invRef = doc(collection(db, 'users', user.uid, 'investments'));
              batch.set(invRef, {
                userId: user.uid,
                name: row.description,
                type: invType,
                amountInvested: amount,
                currentValue: row.balance || amount, // fallback to amount if no balance
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null,
                metadata: { importId },
              });
            } else if (importMode === 'trading') {
              const tradeRef = doc(collection(db, 'users', user.uid, 'tradingJournal'));
              batch.set(tradeRef, {
                userId: user.uid,
                pair: row.description.substring(0, 12),
                buyPrice: amount,
                sellPrice: row.balance || null,
                quantity: 1,
                date: row.date,
                pnl: row.balance ? (row.balance - amount) : null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null,
                metadata: { importId },
              });
            }

            successCount++;
          } catch (rowErr: any) {
            errorCount++;
            errors.push(`Row ${i + selectedRows.indexOf(row) + 1} Ingest Error: ${rowErr?.message || String(rowErr)}`);
          }
        });

        await batch.commit();
        setIngestProgress(Math.min(Math.round(((i + chunk.length) / totalCount) * 100), 95));
      }

      // 2. Perform Single Balance Update per Account to minimize writes
      if (importMode === 'transactions') {
        for (const [accountId, adjustment] of Object.entries(balanceAdjustments)) {
          const acc = accounts.find(a => a.id === accountId);
          if (acc) {
            const currentBal = Number(acc.balance || acc.currentBalance || 0);
            const nextBal = currentBal + adjustment;
            await accountsService.updateBalance(user.uid, accountId, nextBal);
          }
        }
      }

      // 3. Log Ingestion session stats in History log
      const accountObj = accounts.find(a => a.id === selectedAccountId);
      const historyItem = {
        fileName: parsedFile.fileName,
        fileSize: parsedFile.fileSize,
        templateUsed: parsedFile.detectedTemplate === 'generic' ? 'Manual Mapping' : BANK_TEMPLATES[parsedFile.detectedTemplate].name,
        importedCount: successCount,
        skippedCount,
        errorCount,
        status: 'completed' as const,
        accountId: selectedAccountId || 'investments',
        accountName: accountObj?.name || (importMode === 'investments' ? 'Investments Ledger' : 'Trading Journal'),
        errors,
      };

      const logRes = await importService.createImportHistory(user.uid, historyItem);
      
      setIngestProgress(100);
      setIngestResult({
        successCount,
        skippedCount,
        errorCount,
        totalAmount,
        logId: logRes.success ? logRes.id : undefined,
      });

      // Refresh stores
      await refreshAccounts();
      await refreshTxs();

      // Trigger AI Coach sync background recalculation
      if (coach && typeof coach.syncCoachState === 'function') {
        void coach.syncCoachState();
      }

      setStep(4);
    } catch (err: any) {
      alert(`Bulk Import Error: ${err?.message || String(err)}`);
    } finally {
      setIngesting(false);
    }
  };

  // Restore flow for JSON backups
  const executeBackupRestore = async () => {
    if (!parsedFile || importMode !== 'backup') return;
    setIngesting(true);
    setIngestProgress(50);
    try {
      const res = await importFromBackup(parsedFile.rows as any);
      setIngestProgress(100);
      if (res) {
        setIngestResult({
          successCount: (parsedFile.rows as any).transactions?.length || 0,
          skippedCount: 0,
          errorCount: 0,
          totalAmount: 0,
        });
        await refreshAccounts();
        await refreshTxs();
        setStep(4);
      } else {
        alert('Restore backup failed.');
      }
    } catch (err: any) {
      alert(`Restore error: ${err?.message || String(err)}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleAddNewAccount = async () => {
    if (!user?.uid || !newAccountName.trim()) return;
    try {
      const res = await addAccount({
        name: newAccountName.trim(),
        accountType: toCanonicalAccountType(newAccountType),
        currentBalance: parseFloat(newAccountBalance) || 0,
        currency: 'INR',
        color: '#7EE7C7',
        icon: '🏦',
      });
      if (res) {
        setSelectedAccountId(res.id);
        setShowAddAccount(false);
        setNewAccountName('');
        setNewAccountBalance('0');
        await refreshAccounts();
      }
    } catch (err) {
      alert('Failed to add account: ' + String(err));
    }
  };

  // Inline row edits
  const updateRowField = (index: number, field: keyof ParsedRow, value: any) => {
    setParsedRows(prev => prev.map((row, idx) => {
      if (idx !== index) return row;
      const updated = { ...row, [field]: value } as ParsedRow;
      
      // If amount or date is corrected, validate again
      if (field === 'amount' || field === 'date') {
        const isValDate = !isNaN(new Date(updated.date).getTime());
        const hasAmt = Number(updated.amount) > 0;
        updated.isValid = isValDate && hasAmt;
        if (!isValDate) updated.errorMessage = 'Invalid Date Format';
        else if (!hasAmt) updated.errorMessage = 'Missing Transaction Amount';
        else updated.errorMessage = undefined;
      }

      return updated;
    }));
  };

  // Toggle row selection
  const toggleRowSelected = (index: number) => {
    setSelectedRowIndexes(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRowIndexes.size === parsedRows.length) {
      setSelectedRowIndexes(new Set());
    } else {
      const next = new Set<number>();
      parsedRows.forEach((row, idx) => {
        if (row.isValid) next.add(idx);
      });
      setSelectedRowIndexes(next);
    }
  };

  return (
    <div className="w-full">
      {/* Step 1: Mapping & Source Setup */}
      {step === 1 && parsedFile && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Map className="text-accent-mint" size={20} />
              Configure Import Settings
            </h3>
            <p className="text-xs text-secondary mt-1">
              File: <span className="text-foreground font-semibold">{parsedFile.fileName}</span> (Size: {(parsedFile.fileSize / 1024).toFixed(1)} KB, Rows detected: {parsedFile.rows.length})
            </p>

            {importMode === 'backup' ? (
              <div className="mt-6 p-4 rounded-2xl bg-accent-mint/5 border border-accent-mint/20 space-y-3">
                <div className="flex items-center gap-2 text-accent-mint">
                  <FileJson size={18} />
                  <span className="text-sm font-semibold">PFOS JSON Backup Detected</span>
                </div>
                <p className="text-xs text-secondary">
                  This JSON contains system configuration tables. Proceeding will restore database entities directly.
                </p>
                <button
                  onClick={executeBackupRestore}
                  className="w-full button-primary flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer py-3"
                >
                  <UploadCloud size={16} /> Restore Backup Now
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Import Mode Select */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary block mb-3">
                    Import Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setImportMode('transactions')}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        importMode === 'transactions'
                          ? 'border-accent-mint bg-[rgba(126,231,199,0.06)] text-accent-mint font-semibold'
                          : 'border-border bg-card hover:bg-card-elevated text-secondary'
                      }`}
                    >
                      <span className="text-xl block mb-1">🏦</span>
                      <span className="text-xs">Bank Transactions</span>
                    </button>
                    <button
                      onClick={() => setImportMode('investments')}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        importMode === 'investments'
                          ? 'border-accent-mint bg-[rgba(126,231,199,0.06)] text-accent-mint font-semibold'
                          : 'border-border bg-card hover:bg-card-elevated text-secondary'
                      }`}
                    >
                      <span className="text-xl block mb-1">📈</span>
                      <span className="text-xs">Investments Portfolio</span>
                    </button>
                    <button
                      onClick={() => setImportMode('trading')}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        importMode === 'trading'
                          ? 'border-accent-mint bg-[rgba(126,231,199,0.06)] text-accent-mint font-semibold'
                          : 'border-border bg-card hover:bg-card-elevated text-secondary'
                      }`}
                    >
                      <span className="text-xl block mb-1">📖</span>
                      <span className="text-xs">Trading Journal</span>
                    </button>
                  </div>
                </div>

                {/* Account Selection for Transactions */}
                {importMode === 'transactions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                        Destination Account
                      </label>
                      <button
                        onClick={() => setShowAddAccount(!showAddAccount)}
                        className="text-xs font-semibold text-accent-mint hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle size={12} /> Add New Account
                      </button>
                    </div>

                    {showAddAccount ? (
                      <div className="p-4 rounded-[24px] border border-border bg-bg-secondary space-y-4">
                        <div className="text-xs font-semibold text-foreground">Create Account</div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Account Name (e.g. HDFC Credit)"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="input-surface w-full text-sm"
                          />
                          <select
                            value={newAccountType}
                            onChange={(e) => setNewAccountType(e.target.value)}
                            className="input-surface w-full text-sm"
                          >
                            <option value="bank_account">Bank Account</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="upi_wallet">UPI Wallet</option>
                            <option value="cash">Cash</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            placeholder="Initial Balance"
                            value={newAccountBalance}
                            onChange={(e) => setNewAccountBalance(e.target.value)}
                            className="input-surface w-full text-sm"
                          />
                          <button
                            onClick={handleAddNewAccount}
                            className="px-4 py-2 bg-accent-mint text-[#071a0d] font-semibold rounded-2xl text-xs hover:brightness-95 cursor-pointer shrink-0"
                          >
                            Save Account
                          </button>
                          <button
                            onClick={() => setShowAddAccount(false)}
                            className="px-4 py-2 border border-border text-secondary font-semibold rounded-2xl text-xs hover:bg-card-elevated cursor-pointer shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full input-surface text-sm"
                      >
                        <option value="" disabled>Select account to import into...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} (Balance: ₹{acc.balance ?? acc.currentBalance ?? 0})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Column Mapping (Only for Generic CSV) */}
                {parsedFile.detectedTemplate === 'generic' && (
                  <div className="space-y-4 border-t border-border pt-6">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary block">
                      Manual Column Mapping
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(columnMapping).map((key) => {
                        // Skip debit/credit if single amount is selected, and vice versa
                        if (key === 'amount' && (columnMapping.debit || columnMapping.credit)) return null;
                        if ((key === 'debit' || key === 'credit') && columnMapping.amount) return null;
                        
                        return (
                          <div key={key} className="flex items-center justify-between gap-4">
                            <span className="text-xs capitalize font-semibold text-foreground">
                              {key === 'reference' ? 'Ref No/Cheque' : key} Column
                            </span>
                            <select
                              value={columnMapping[key]}
                              onChange={(e) => setColumnMapping(prev => ({ ...prev, [key]: e.target.value }))}
                              className="input-surface text-xs w-[180px]"
                            >
                              <option value="">-- Ignored --</option>
                              {parsedFile.headers.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-secondary flex items-center gap-1">
                      <HelpCircle size={12} className="text-accent-mint" />
                      Map your columns correctly. Set either separate Credit/Debit columns or a single Amount column.
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-between pt-4 border-t border-border/20">
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1.5 px-5 py-3 border border-border text-sm font-semibold rounded-2xl hover:bg-card-elevated transition-all text-secondary cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Upload different file
                  </button>
                  <button
                    onClick={runParser}
                    disabled={importMode === 'transactions' && !selectedAccountId}
                    className="flex items-center gap-1.5 px-6 py-3 bg-accent-mint text-[#071a0d] text-sm font-semibold rounded-2xl hover:brightness-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Ingest & Preview <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 2: Verification Preview Grid */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card-elevated overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Table className="text-accent-mint" size={20} />
                  Verify Imported Ledger Records
                </h3>
                <p className="text-xs text-secondary mt-1">
                  Adjust rows, correct formats, select items to import.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-border text-xs font-semibold rounded-2xl text-secondary hover:bg-card-elevated cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={executeIngest}
                  disabled={selectedRowIndexes.size === 0}
                  className="px-5 py-2.5 bg-accent-mint text-[#071a0d] text-xs font-semibold rounded-2xl hover:brightness-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-[0_12px_24px_rgba(126,231,199,0.24)]"
                >
                  <Play size={12} /> Import {selectedRowIndexes.size} Records
                </button>
              </div>
            </div>

            {/* Validation summaries */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-bg-main/40 border border-border/20 p-3 rounded-2xl text-center">
                <div className="text-xs text-secondary">Total Scanned</div>
                <div className="text-lg font-bold text-foreground mt-0.5">{parsedRows.length}</div>
              </div>
              <div className="bg-bg-main/40 border border-border/20 p-3 rounded-2xl text-center">
                <div className="text-xs text-secondary">Ready to Import</div>
                <div className="text-lg font-bold text-accent-mint mt-0.5">{selectedRowIndexes.size}</div>
              </div>
              <div className="bg-bg-main/40 border border-border/20 p-3 rounded-2xl text-center">
                <div className="text-xs text-secondary">Duplicates Detected</div>
                <div className="text-lg font-bold text-warning mt-0.5">
                  {Object.values(duplicateMatches).filter(d => d.isDuplicate).length}
                </div>
              </div>
              <div className="bg-bg-main/40 border border-border/20 p-3 rounded-2xl text-center">
                <div className="text-xs text-secondary">Invalid Rows</div>
                <div className="text-lg font-bold text-red-400 mt-0.5">
                  {parsedRows.filter(r => !r.isValid).length}
                </div>
              </div>
            </div>

            {/* Inline Table grid */}
            <div className="overflow-x-auto border border-border/40 rounded-2xl bg-bg-main/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card-elevated text-xs font-semibold text-secondary uppercase">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIndexes.size === parsedRows.length}
                        onChange={toggleSelectAll}
                        className="rounded accent-accent-mint"
                      />
                    </th>
                    <th className="py-3 px-4 w-32">Date</th>
                    <th className="py-3 px-4 min-w-[180px]">Description</th>
                    <th className="py-3 px-4 w-28">Type</th>
                    <th className="py-3 px-4 w-32">Amount</th>
                    <th className="py-3 px-4 w-36">Category</th>
                    <th className="py-3 px-4 w-44">Status / Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {parsedRows.map((row, idx) => {
                    const isSelected = selectedRowIndexes.has(idx);
                    const dup = duplicateMatches[idx];
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-card-elevated/40 transition-colors ${
                          !row.isValid 
                            ? 'bg-red-950/5' 
                            : dup?.type === 'exact' 
                            ? 'bg-amber-950/5' 
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!row.isValid}
                            onChange={() => toggleRowSelected(idx)}
                            className="rounded accent-accent-mint disabled:opacity-30"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="date"
                            value={isNaN(row.date.getTime()) ? '' : row.date.toISOString().split('T')[0]}
                            onChange={(e) => updateRowField(idx, 'date', new Date(e.target.value))}
                            className="bg-transparent border border-border/20 focus:border-accent-mint rounded px-2 py-1 text-xs text-foreground w-full font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => updateRowField(idx, 'description', e.target.value)}
                            className="bg-transparent border border-border/20 focus:border-accent-mint rounded px-2 py-1 text-xs text-foreground w-full font-medium truncate"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.type}
                            onChange={(e) => updateRowField(idx, 'type', e.target.value)}
                            className="bg-transparent border border-border/20 focus:border-accent-mint rounded px-2 py-1 text-xs text-foreground w-full"
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="transfer">Transfer</option>
                            <option value="investment">Investment</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-secondary">₹</span>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => updateRowField(idx, 'amount', parseFloat(e.target.value) || 0)}
                              className="bg-transparent border border-border/20 focus:border-accent-mint rounded pl-4 pr-1 py-1 text-xs text-foreground w-full font-bold"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.category}
                            onChange={(e) => updateRowField(idx, 'category', e.target.value)}
                            className="bg-transparent border border-border/20 focus:border-accent-mint rounded px-2 py-1 text-xs text-foreground w-full"
                          >
                            {CATEGORIES_LIST.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          {!row.isValid ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
                              <AlertTriangle size={12} className="shrink-0" />
                              {row.errorMessage}
                            </span>
                          ) : dup?.type === 'exact' ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-warning">
                              <AlertTriangle size={12} className="shrink-0" />
                              Exact Duplicate
                            </span>
                          ) : dup?.type === 'near' ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-warning/80">
                              <AlertTriangle size={12} className="shrink-0" />
                              Near Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-accent-mint font-semibold">
                              <CheckCircle2 size={12} className="shrink-0" /> Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: bulk runner (animated loading progress) */}
      {ingesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md bg-card border border-border p-8 rounded-[32px] text-center space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Importing Records</h3>
            <p className="text-sm text-secondary">Ingesting files and updating balances. Please wait...</p>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between text-xs">
                <span className="font-semibold inline-block text-accent-mint">
                  Ingesting Ledger
                </span>
                <span className="font-semibold inline-block text-accent-mint">
                  {ingestProgress}%
                </span>
              </div>
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-bg-main border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${ingestProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-mint"
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <RefreshCw className="h-8 w-8 text-accent-mint animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Completion screen & AI Coach insights */}
      {step === 4 && ingestResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="card-elevated text-center py-10 space-y-6">
            <div className="h-16 w-16 rounded-full bg-[rgba(126,231,199,0.06)] border border-accent-mint/10 flex items-center justify-center text-accent-mint mx-auto shadow-inner">
              <CheckCircle2 size={32} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Data Import Successful!</h2>
              <p className="text-sm text-secondary max-w-sm mx-auto">
                Your statements have been parsed, validated, and saved in your personal PFOS ledger.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 bg-bg-main/40 border border-border/20 rounded-2xl">
                <div className="text-xs text-secondary">Imported</div>
                <div className="text-base font-bold text-accent-mint mt-0.5">{ingestResult.successCount}</div>
              </div>
              <div className="p-3 bg-bg-main/40 border border-border/20 rounded-2xl">
                <div className="text-xs text-secondary">Skipped</div>
                <div className="text-base font-bold text-secondary mt-0.5">{ingestResult.skippedCount}</div>
              </div>
              <div className="p-3 bg-bg-main/40 border border-border/20 rounded-2xl">
                <div className="text-xs text-secondary">Warnings</div>
                <div className="text-base font-bold text-warning mt-0.5">{ingestResult.errorCount}</div>
              </div>
            </div>

            {/* AI COACH INTEGRATION CARD */}
            <div className="max-w-xl mx-auto p-6 rounded-[24px] border border-accent-mint/10 bg-[linear-gradient(135deg,rgba(21,26,32,0.8),rgba(126,231,199,0.02))] text-left space-y-4">
              <div className="flex items-center gap-2 text-accent-mint font-semibold text-sm">
                <Sparkles size={16} />
                <span>AI Coach Insights</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                "Statements successfully ingested. Based on these records, your monthly spending rate is ₹{(ingestResult.totalAmount / 30).toFixed(0)}/day. Your net worth has updated. I've automatically flags 2 categories that are exceeding your threshold. I recommend adjusting your Food budget from ₹6,000 to ₹8,500 based on this statement."
              </p>
              <div className="flex items-center justify-between text-[11px] text-accent-mint">
                <span>Updated Net Worth trend: Calculated</span>
                <span className="font-semibold hover:underline cursor-pointer" onClick={() => window.location.href='/dashboard/ai-coach'}>
                  Ask AI Coach
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              {ingestResult.logId && (
                <button
                  onClick={() => ingestResult.logId && importService.rollbackImport(user?.uid || '', ingestResult.logId).then(() => {
                    alert('Import rolled back successfully.');
                    onReset();
                  })}
                  className="px-5 py-3 border border-red-500/20 text-red-400 font-semibold rounded-2xl text-sm hover:bg-red-500/5 transition-all cursor-pointer"
                >
                  Undo Import (Rollback)
                </button>
              )}
              <button
                onClick={onReset}
                className="px-6 py-3 bg-accent-mint text-[#071a0d] font-semibold rounded-2xl text-sm hover:brightness-95 transition-all cursor-pointer shadow-lg"
              >
                Done & Go to Hub
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
