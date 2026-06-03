import type { ParsedRow } from './BankStatementMapper';

export interface DuplicateMatch {
  isDuplicate: boolean;
  type: 'exact' | 'near';
  existingRecord: any;
}

/**
 * Scan incoming rows and compare them to existing transactions to identify duplicates.
 * Returns a mapping of row index to its duplicate match state.
 */
export function findDuplicates(
  incoming: ParsedRow[],
  existing: any[]
): Record<number, DuplicateMatch> {
  const duplicates: Record<number, DuplicateMatch> = {};

  const cleanDesc = (desc: string) =>
    String(desc || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

  const toDateStr = (date: any) => {
    if (!date) return '';
    const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  incoming.forEach((row, index) => {
    if (!row.isValid) return;

    const incomingDateStr = toDateStr(row.date);
    const incomingAmt = Number(row.amount);
    const incomingClean = cleanDesc(row.description);

    for (const ext of existing) {
      if (ext.deletedAt) continue;

      const extDateStr = toDateStr(ext.date);
      const extAmt = Number(ext.amount);
      const extClean = cleanDesc(ext.description || ext.category || '');

      // Check if Date and Amount are identical
      if (incomingDateStr === extDateStr && Math.abs(incomingAmt - extAmt) < 0.01) {
        const isDescExact = incomingClean === extClean || 
                            (incomingClean.length > 3 && extClean.includes(incomingClean)) || 
                            (extClean.length > 3 && incomingClean.includes(extClean));

        if (isDescExact) {
          duplicates[index] = {
            isDuplicate: true,
            type: 'exact',
            existingRecord: ext,
          };
          break; // Found exact match, stop scanning for this row
        } else {
          // If we haven't found an exact match yet, record as near duplicate
          if (!duplicates[index]) {
            duplicates[index] = {
              isDuplicate: true,
              type: 'near',
              existingRecord: ext,
            };
          }
        }
      }
    }
  });

  return duplicates;
}
