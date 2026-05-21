import { DocumentStatus } from '@/src/types/document';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentFilterBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: DocumentStatus | 'all';
  onStatusChange: (status: DocumentStatus | 'all') => void;
}

export function DocumentFilterBar({
  open,
  onOpenChange,
  statusFilter,
  onStatusChange,
}: DocumentFilterBarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => onOpenChange(false)}>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl border-t border-border shadow-xl max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-4">
          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Status</h3>
            <div className="space-y-2">
              {['all', 'active', 'upcoming', 'expired', 'completed'].map(status => (
                <label key={status} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === status}
                    onChange={() => onStatusChange(status as DocumentStatus | 'all')}
                    className="w-4 h-4 accent-accent-mint"
                  />
                  <span className="text-foreground capitalize">
                    {status === 'all' ? 'All Statuses' : status}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="p-6 border-t border-border">
          <button
            onClick={() => {
              onStatusChange('all');
              onOpenChange(false);
            }}
            className="w-full px-4 py-2 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
