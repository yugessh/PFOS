import type { TransactionStatus } from '@/types';

export function formatTransactionStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case 'posted':
      return 'Posted';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'cleared':
      return 'Cleared';
    default:
      return status;
  }
}

/**
 * INR formatting with a fixed locale for consistent SSR/client output.
 */
export function formatInrAmount(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function formatSignedTransactionAmount(
  amount: number,
  type: 'income' | 'expense'
): string {
  const formatted = formatInrAmount(amount);
  return type === 'income' ? `+${formatted}` : `−${formatted}`;
}
