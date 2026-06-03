'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Calendar,
  XCircle
} from 'lucide-react';
import { useAuthContext } from '@/src/context/AuthContext';
import { importService, type ImportHistoryRecord } from '@/src/services/firestore/import.service';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';

export default function ImportHistoryList() {
  const { user } = useAuthContext();
  const { refresh: refreshTransactions } = useTransactions();
  const { refresh: refreshAccounts } = useAccounts();
  
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await importService.getUserImportHistory(user.uid);
      if (res.success && res.data) {
        setHistory(res.data);
      } else {
        setError(res.error || 'Failed to fetch import logs');
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleRollback = async (importId: string) => {
    if (!user?.uid) return;
    if (!confirm('Are you sure you want to rollback this import? This will delete all transactions, trades, and investments created in this run, and restore original account balances.')) {
      return;
    }

    setRollingBackId(importId);
    try {
      const res = await importService.rollbackImport(user.uid, importId);
      if (res.success) {
        // Refresh local cache/stores
        await refreshTransactions();
        await refreshAccounts();
        await loadHistory();
      } else {
        alert(res.error || 'Rollback failed');
      }
    } catch (err: any) {
      alert(`Rollback error: ${err?.message || String(err)}`);
    } finally {
      setRollingBackId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="h-10 w-10 text-accent-mint animate-spin" />
        <p className="text-sm text-secondary">Loading import history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-[28px] border border-border bg-card text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
        <h3 className="font-semibold text-foreground">Failed to load logs</h3>
        <p className="text-sm text-secondary">{error}</p>
        <button 
          onClick={() => void loadHistory()}
          className="px-4 py-2 text-sm font-semibold rounded-2xl bg-card-elevated hover:bg-card border border-border text-foreground transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-12 rounded-[28px] border border-border bg-card text-center space-y-4 shadow-lg">
        <div className="h-16 w-16 rounded-3xl bg-[rgba(126,231,199,0.04)] border border-accent-mint/10 flex items-center justify-center text-accent-mint mx-auto">
          <History size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-base">No imports recorded</h3>
          <p className="text-sm text-secondary max-w-xs mx-auto">
            You haven't imported any external statement files yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <History size={18} className="text-accent-mint" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-secondary">Past Imports</h2>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {history.map((item) => {
            const isRolledBack = item.status === 'rolled_back';
            const isRolling = rollingBackId === item.id;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`p-6 rounded-[28px] border bg-card transition-all duration-300 shadow-md ${
                  isRolledBack 
                    ? 'border-border/30 opacity-70' 
                    : 'border-border hover:border-accent-mint/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isRolledBack 
                        ? 'bg-border/10 text-secondary' 
                        : 'bg-[rgba(126,231,199,0.06)] text-accent-mint'
                    }`}>
                      <FileText size={20} />
                    </div>
                    
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate max-w-[280px] sm:max-w-md">
                        {item.fileName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : ''}
                        </span>
                        <span>•</span>
                        <span>{formatSize(item.fileSize)}</span>
                        <span>•</span>
                        <span>{item.templateUsed.toUpperCase()}</span>
                      </div>
                      <div className="text-xs font-semibold text-accent-mint pt-1">
                        Imported to: <span className="text-foreground">{item.accountName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0">
                    <div className="space-y-1 text-left sm:text-right">
                      <div className="text-xs text-secondary font-medium">Summary</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-950/20 text-[#4ADE80] border border-emerald-500/10">
                          {item.importedCount} Ingested
                        </span>
                        {item.errorCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-950/20 text-red-400 border border-red-500/10">
                            {item.errorCount} Errors
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRolledBack ? (
                        <span className="flex items-center gap-1 text-xs font-semibold bg-border/20 px-3 py-1.5 rounded-[16px] text-secondary">
                          <XCircle size={14} /> Rolled Back
                        </span>
                      ) : (
                        <button
                          onClick={() => item.id && handleRollback(item.id)}
                          disabled={isRolling}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-red-950/20 hover:bg-red-950/40 px-3 py-2 rounded-[16px] text-red-400 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                        >
                          {isRolling ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              Undoing...
                            </>
                          ) : (
                            <>
                              <Trash2 size={12} />
                              Rollback
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {item.errors && item.errors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> Warning logs:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {item.errors.slice(0, 3).map((err, idx) => (
                        <li key={idx} className="text-[11px] text-secondary truncate max-w-full">
                          {err}
                        </li>
                      ))}
                      {item.errors.length > 3 && (
                        <li className="text-[11px] text-secondary italic">
                          ...and {item.errors.length - 3} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
