import { useMemo, useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { documentsService } from '@/src/services/firestore/documents.service';
import { Document } from '@/src/types/document';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function DocumentVaultSummaryCard() {
  const auth = useAuthContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.user?.uid) return;

    const loadDocuments = async () => {
      try {
        const response = await documentsService.getUserDocuments(auth.user.uid!);
        if (response.success && response.data) {
          const docs = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDocuments();
  }, [auth?.user?.uid]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueThisWeek = documents.filter(d => {
      const date = d.dueDate || d.renewalDate;
      return date && date >= now && date <= weekFromNow;
    }).length;

    const expired = documents.filter(d => d.status === 'expired').length;

    return {
      total: documents.length,
      dueThisWeek,
      expired,
    };
  }, [documents]);

  if (loading || stats.total === 0) return null;

  return (
    <Link href="/dashboard/documents">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group cursor-pointer rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 hover:shadow-lg transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Document Vault</p>
            <h3 className="text-lg font-semibold text-foreground">{stats.total} Documents</h3>
          </div>
          <span className="text-2xl">📋</span>
        </div>

        <div className="space-y-2 mb-4">
          {stats.dueThisWeek > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Due this week</span>
              <span className="font-semibold text-orange-400">{stats.dueThisWeek}</span>
            </div>
          )}
          {stats.expired > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expired</span>
              <span className="font-semibold text-red-400">{stats.expired}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">View all documents</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
}
