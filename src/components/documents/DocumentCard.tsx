import { useState } from 'react';
import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/src/lib/currency';
import { Document, DocumentCategory } from '@/src/types/document';
import { MoreVertical, Download, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons: Record<DocumentCategory, string> = {
  insurance: '🛡️',
  bills: '📄',
  warranty: '🔧',
  loans: '🏦',
  tax: '📋',
  subscription: '🔔',
  other: '📎',
};

const statusColors = {
  active: 'border-green-500/20 bg-green-500/5',
  expired: 'border-red-500/20 bg-red-500/5',
  upcoming: 'border-blue-500/20 bg-blue-500/5',
  completed: 'border-gray-500/20 bg-gray-500/5',
};

const statusBadgeColors = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/30',
  expired: 'bg-red-500/10 text-red-400 border border-red-500/30',
  upcoming: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  completed: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
};

interface DocumentCardProps {
  document: Document;
  onUpdate?: () => void;
}

export function DocumentCard({ document, onUpdate }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const daysUntilDue = document.renewalDate
    ? Math.ceil((document.renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <motion.div
      layout
      className={`border rounded-2xl p-4 backdrop-blur-sm transition-all hover:shadow-lg ${statusColors[document.status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{categoryIcons[document.category]}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{document.title}</h3>
              {document.provider && (
                <p className="text-xs text-muted-foreground truncate">{document.provider}</p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {document.amount && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-accent-mint">{formatCurrency(document.amount)}</p>
              </div>
            )}

            {(document.dueDate || document.renewalDate) && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                <p className="font-semibold text-foreground">
                  {formatDate(document.dueDate || document.renewalDate!)}
                </p>
                {daysUntilDue !== null && (
                  <p className={`text-xs mt-1 ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-orange-400' : 'text-green-400'}`}>
                    {isOverdue
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : isDueSoon
                      ? `${daysUntilDue} days left`
                      : 'On time'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Attachments Badge */}
          {document.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded">
                📎 {document.attachments.length} file{document.attachments.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge and Menu */}
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeColors[document.status]}`}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </span>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors relative"
          >
            <MoreVertical size={16} className="text-muted-foreground" />

            {/* Dropdown Menu */}
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-48"
              >
                {document.attachments.length > 0 && (
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => {
                      window.open(document.attachments[0].url, '_blank');
                      setMenuOpen(false);
                    }}
                  >
                    <Eye size={16} />
                    View Document
                  </button>
                )}
                {document.attachments.length > 0 && (
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = document.attachments[0].url;
                      link.download = document.attachments[0].filename;
                      link.click();
                      setMenuOpen(false);
                    }}
                  >
                    <Download size={16} />
                    Download
                  </button>
                )}
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                  onClick={() => {
                    // TODO: implement delete
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </motion.div>
            )}
          </button>
        </div>
      </div>

      {/* Notes */}
      {document.notes && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{document.notes}</p>
      )}
    </motion.div>
  );
}
