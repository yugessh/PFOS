import { useState } from 'react';
import { Document, DocumentCategory } from '@/src/types/document';
import { documentsService } from '@/src/services/firestore/documents.service';
import { useAuthContext } from '@/src/context/AuthContext';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const categories: { value: DocumentCategory; label: string; icon: string }[] = [
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'bills', label: 'Bills', icon: '📄' },
  { value: 'warranty', label: 'Warranty', icon: '🔧' },
  { value: 'loans', label: 'Loans', icon: '🏦' },
  { value: 'tax', label: 'Tax Documents', icon: '📋' },
  { value: 'subscription', label: 'Subscriptions', icon: '🔔' },
  { value: 'other', label: 'Other', icon: '📎' },
];

interface AddDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function AddDocumentModal({ open, onOpenChange, onSave }: AddDocumentModalProps) {
  const auth = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'bills' as DocumentCategory,
    provider: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user?.uid) return;

    setLoading(true);
    try {
      const dueDate = formData.dueDate ? new Date(formData.dueDate) : undefined;

      const doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'> = {
        title: formData.title,
        category: formData.category,
        provider: formData.provider || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        dueDate,
        renewalDate: dueDate,
        status: 'active',
        attachments: [],
        notes: formData.notes || undefined,
        reminders: [
          { type: 'before_7_days', enabled: true },
          { type: 'before_3_days', enabled: true },
          { type: 'before_1_day', enabled: true },
        ],
      };

      const result = await documentsService.createDocument(auth.user.uid, doc);
      if (result.success) {
        setFormData({
          title: '',
          category: 'bills',
          provider: '',
          amount: '',
          dueDate: '',
          notes: '',
        });
        onOpenChange(false);
        onSave?.();
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-background w-full md:w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Document</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium block mb-2">Document Title*</label>
            <input
              type="text"
              required
              placeholder="e.g., Home Insurance Policy"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-mint"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium block mb-2">Category*</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                    formData.category === cat.value
                      ? 'bg-accent-mint/20 border-accent-mint text-accent-mint'
                      : 'bg-muted border-border text-foreground hover:bg-muted/80'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="text-sm font-medium block mb-2">Provider</label>
            <input
              type="text"
              placeholder="e.g., ABC Insurance Co."
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-mint"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium block mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-mint"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium block mb-2">Due/Renewal Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-mint"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium block mb-2">Notes</label>
            <textarea
              placeholder="Add any additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-mint resize-none"
              rows={3}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="w-full py-3 bg-accent-mint text-[#071a0d] rounded-lg font-semibold transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Document'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
