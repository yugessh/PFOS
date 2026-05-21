'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/src/context/AuthContext';
import { documentsService } from '@/src/services/firestore/documents.service';
import { Document, DocumentCategory, DocumentStatus } from '@/src/types/document';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/src/lib/currency';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { DocumentCard } from '@/src/components/documents/DocumentCard';
import { AddDocumentModal } from '@/src/components/documents/AddDocumentModal';
import { DocumentFilterBar } from '@/src/components/documents/DocumentFilterBar';
import { motion } from 'framer-motion';

type FilterTab = 'all' | DocumentCategory | 'due' | 'expired';

const categoryLabels: Record<DocumentCategory, string> = {
  insurance: 'Insurance',
  bills: 'Bills',
  warranty: 'Warranty',
  loans: 'Loans',
  tax: 'Tax Documents',
  subscription: 'Subscriptions',
  other: 'Other',
};

const categoryIcons: Record<DocumentCategory, string> = {
  insurance: '🛡️',
  bills: '📄',
  warranty: '🔧',
  loans: '🏦',
  tax: '📋',
  subscription: '🔔',
  other: '📎',
};

export default function DocumentsPage() {
  const auth = useAuthContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

  const loadDocuments = useCallback(async () => {
    if (!auth?.user?.uid) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await documentsService.getUserDocuments(auth.user.uid);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load documents');
      }

      const docs = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Convert dates
      const convertedDocs = docs.map(d => ({
        ...d,
        createdAt: d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt),
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt : new Date(d.updatedAt),
        dueDate: d.dueDate instanceof Date ? d.dueDate : (d.dueDate ? new Date(d.dueDate) : undefined),
        renewalDate: d.renewalDate instanceof Date ? d.renewalDate : (d.renewalDate ? new Date(d.renewalDate) : undefined),
      }));

      setDocuments(convertedDocs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Apply category/status filter
    if (activeFilter === 'due') {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter(d => {
        const date = d.dueDate || d.renewalDate;
        return date && date >= now && date <= weekFromNow;
      });
    } else if (activeFilter === 'expired') {
      result = result.filter(d => d.status === 'expired');
    } else if (activeFilter !== 'all') {
      result = result.filter(d => d.category === activeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.provider?.toLowerCase().includes(query) ||
        d.notes?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const dateA = a.renewalDate || a.dueDate || a.createdAt;
      const dateB = b.renewalDate || b.dueDate || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  }, [documents, activeFilter, statusFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingRenewals = documents.filter(d => {
      const date = d.renewalDate;
      return date && date >= now && date <= weekFromNow && d.status !== 'expired';
    }).length;

    const monthlyBills = documents.filter(d => {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const date = d.dueDate || d.renewalDate;
      return (d.category === 'bills' || d.category === 'subscription') && date && date >= monthStart && date <= monthEnd;
    }).length;

    const totalPolicies = documents.filter(d => d.category === 'insurance').length;
    const dueThisWeek = documents.filter(d => {
      const date = d.dueDate || d.renewalDate;
      return date && date >= now && date <= weekFromNow;
    }).length;

    return { upcomingRenewals, monthlyBills, totalPolicies, dueThisWeek, total: documents.length };
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-main px-4 py-10 text-white">
        <LoadingState type="table" className="mx-auto max-w-5xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-main px-4 py-10 text-white">
        <ErrorState
          title="Unable to load documents"
          description={error || 'Please refresh or check your connection.'}
          retryAction={
            <button
              type="button"
              onClick={() => void loadDocuments()}
              className="rounded-full bg-accent-mint px-5 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_14px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Document Vault</h1>
        <p className="text-gray-400">Manage bills, policies, and important documents</p>
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Total Documents</p>
            <p className="text-2xl font-bold text-white">{summaryStats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Due This Week</p>
            <p className="text-2xl font-bold text-orange-400">{summaryStats.dueThisWeek}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Monthly Bills</p>
            <p className="text-2xl font-bold text-cyan-400">{summaryStats.monthlyBills}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Policies</p>
            <p className="text-2xl font-bold text-purple-400">{summaryStats.totalPolicies}</p>
          </motion.div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Open filters"
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-accent-mint text-[#071a0d]'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('due')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeFilter === 'due'
                ? 'bg-orange-500 text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Due This Week
          </button>
          {(Object.keys(categoryLabels) as DocumentCategory[]).map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === category
                  ? 'bg-accent-mint text-[#071a0d]'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <span>{categoryIcons[category]}</span>
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="px-4 py-12">
          <EmptyState
            title={searchQuery ? 'No documents found' : 'No documents added yet'}
            description={searchQuery ? 'Try different search terms' : 'Start organizing your financial documents and bills'}
            icon={<Plus className="w-12 h-12 text-accent-mint" />}
            action={
              <Button
                onClick={() => setAddOpen(true)}
                size="sm"
                className="rounded-full bg-accent-mint px-5 py-3 text-[#071a0d] shadow-[0_14px_36px_rgba(126,231,199,0.24)]"
              >
                Add Document
              </Button>
            }
            className="max-w-xl mx-auto"
          />
        </div>
      ) : (
        <div className="px-4 py-6 space-y-3">
          {filteredDocuments.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <DocumentCard document={doc} onUpdate={() => void loadDocuments()} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add document"
        className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-mint text-[#071a0d] shadow-xl transition-transform hover:scale-105 active:scale-95 font-semibold"
      >
        <Plus className="size-6" />
      </button>

      {/* Modals */}
      <AddDocumentModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={() => void loadDocuments()}
      />

      <DocumentFilterBar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
    </div>
  );
}
