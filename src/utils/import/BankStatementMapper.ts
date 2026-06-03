import { detectTransactionType, autoCategorize, type TransactionType } from './SmartCategoryEngine';

export interface ParsedRow {
  date: Date;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  amount: number;
  type: TransactionType;
  category: string;
  icon: string;
  balance: number;
  isValid: boolean;
  errorMessage?: string;
}

export type BankTemplateKey = 'hdfc' | 'icici' | 'sbi' | 'axis' | 'kotak' | 'canara' | 'unionbank' | 'generic';

export const BANK_TEMPLATES: Record<BankTemplateKey, { name: string; headers: string[] }> = {
  hdfc: {
    name: 'HDFC Bank',
    headers: ['Date', 'Narration', 'Chq/Ref No', 'Value Date', 'Withdrawal Amt', 'Deposit Amt', 'Closing Balance'],
  },
  icici: {
    name: 'ICICI Bank',
    headers: ['Transaction Date', 'Cheque No.', 'Description', 'Withdrawal (Dr)', 'Deposit (Cr)', 'Balance'],
  },
  sbi: {
    name: 'State Bank of India',
    headers: ['Txn Date', 'Value Date', 'Description', 'Ref No./Cheque No.', 'Debit', 'Credit', 'Balance'],
  },
  axis: {
    name: 'Axis Bank',
    headers: ['Tran Date', 'Value Date', 'Particulars', 'Chq No', 'Debit', 'Credit', 'Balance'],
  },
  kotak: {
    name: 'Kotak Mahindra Bank',
    headers: ['Date', 'Description', 'Chq/Ref No', 'Amount', 'Dr/Cr', 'Balance'],
  },
  canara: {
    name: 'Canara Bank',
    headers: ['Date', 'Description', 'Ref No', 'Debit', 'Credit', 'Balance'],
  },
  unionbank: {
    name: 'Union Bank of India',
    headers: ['Date', 'Particulars', 'Chq No', 'Withdrawal', 'Deposit', 'Balance'],
  },
  generic: {
    name: 'Generic Statement',
    headers: ['Date', 'Description', 'Amount', 'Type', 'Category'],
  },
};

/**
 * Normalizes Indian date string formats (e.g. DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY) into a Javascript Date object.
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const cleanStr = dateStr.trim();
  
  // Try standard split
  const parts = cleanStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    let year = parseInt(parts[2], 10);
    
    if (parts[2].length === 2) {
      year += 2000; // 2-digit year conversion
    }
    
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year > 1900) {
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  // Fallback to default Date parser
  const parsed = new Date(cleanStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Parses clean numeric value from statements containing currency symbols, commas, or spaces
 */
export function parseAmount(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleanStr = String(val).replace(/[^0-9\.\-]/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Scans headers to auto-detect the matching bank template
 */
export function detectBankTemplate(headers: string[]): BankTemplateKey {
  const normHeaders = headers.map(h => String(h).toLowerCase().trim());

  // Helper to match headers
  const matches = (keywords: string[]) => keywords.some(k => normHeaders.includes(k.toLowerCase()));

  if (matches(['narration', 'withdrawal amt', 'deposit amt', 'closing balance'])) {
    return 'hdfc';
  }
  if (matches(['withdrawal (dr)', 'deposit (cr)', 'cheque no.'])) {
    return 'icici';
  }
  if (matches(['txn date', 'ref no./cheque no.'])) {
    return 'sbi';
  }
  if (matches(['tran date', 'particulars', 'chq no'])) {
    return 'axis';
  }
  if (normHeaders.includes('dr/cr') && normHeaders.includes('amount')) {
    return 'kotak';
  }
  if (normHeaders.includes('ref no') && normHeaders.includes('debit') && normHeaders.includes('credit')) {
    return 'canara';
  }
  if (matches(['particulars', 'withdrawal', 'deposit'])) {
    return 'unionbank';
  }

  return 'generic';
}

/**
 * Parses and maps rows from the uploaded statement to a standard schema
 */
export function parseBankStatementRows(
  rawRows: any[],
  templateKey: BankTemplateKey,
  columnMapping?: Record<string, string> // Optional custom manual mappings
): ParsedRow[] {
  return rawRows
    .map((row, index) => {
      try {
        let dateStr = '';
        let description = '';
        let reference = '';
        let debit = 0;
        let credit = 0;
        let balance = 0;
        let amount = 0;
        let type: TransactionType = 'expense';

        // Apply custom column mapping if present, otherwise fall back to template rules
        if (columnMapping) {
          const map = (key: string) => row[columnMapping[key]] || row[key] || '';
          dateStr = String(map('date'));
          description = String(map('description'));
          reference = String(map('reference'));
          
          if (columnMapping['debit'] && columnMapping['credit']) {
            debit = parseAmount(map('debit'));
            credit = parseAmount(map('credit'));
          } else if (columnMapping['amount']) {
            amount = parseAmount(map('amount'));
            const typeStr = String(map('type')).toLowerCase();
            if (typeStr.includes('inc') || typeStr.includes('cr') || amount > 0) {
              credit = Math.abs(amount);
            } else {
              debit = Math.abs(amount);
            }
          }
          balance = parseAmount(map('balance'));
        } else {
          // Parse using template-specific rules
          switch (templateKey) {
            case 'hdfc':
              dateStr = row['Date'] || row['date'] || '';
              description = row['Narration'] || row['narration'] || '';
              reference = row['Chq/Ref No'] || row['chq/ref no'] || '';
              debit = parseAmount(row['Withdrawal Amt'] || row['withdrawal amt']);
              credit = parseAmount(row['Deposit Amt'] || row['deposit amt']);
              balance = parseAmount(row['Closing Balance'] || row['closing balance']);
              break;

            case 'icici':
              dateStr = row['Transaction Date'] || row['Transaction Date'] || '';
              description = row['Description'] || row['description'] || '';
              reference = row['Cheque No.'] || row['cheque no.'] || '';
              debit = parseAmount(row['Withdrawal (Dr)'] || row['withdrawal (dr)']);
              credit = parseAmount(row['Deposit (Cr)'] || row['deposit (cr)']);
              balance = parseAmount(row['Balance'] || row['balance']);
              break;

            case 'sbi':
              dateStr = row['Txn Date'] || row['Date'] || '';
              description = row['Description'] || row['description'] || '';
              reference = row['Ref No./Cheque No.'] || row['ref no./cheque no.'] || '';
              debit = parseAmount(row['Debit'] || row['debit']);
              credit = parseAmount(row['Credit'] || row['credit']);
              balance = parseAmount(row['Balance'] || row['balance']);
              break;

            case 'axis':
              dateStr = row['Tran Date'] || row['Date'] || '';
              description = row['Particulars'] || row['particulars'] || '';
              reference = row['Chq No'] || row['chq no'] || '';
              debit = parseAmount(row['Debit'] || row['debit']);
              credit = parseAmount(row['Credit'] || row['credit']);
              balance = parseAmount(row['Balance'] || row['balance']);
              break;

            case 'kotak':
              dateStr = row['Date'] || '';
              description = row['Description'] || '';
              reference = row['Chq/Ref No'] || '';
              balance = parseAmount(row['Balance']);
              const amt = parseAmount(row['Amount']);
              const indicator = String(row['Dr/Cr'] || '').toLowerCase();
              if (indicator.includes('cr') || indicator.includes('credit')) {
                credit = amt;
              } else if (indicator.includes('dr') || indicator.includes('debit')) {
                debit = amt;
              } else {
                // If indicator missing, check sign
                if (amt < 0) debit = Math.abs(amt);
                else credit = amt;
              }
              break;

            case 'canara':
              dateStr = row['Date'] || '';
              description = row['Description'] || '';
              reference = row['Ref No'] || '';
              debit = parseAmount(row['Debit']);
              credit = parseAmount(row['Credit']);
              balance = parseAmount(row['Balance']);
              break;

            case 'unionbank':
              dateStr = row['Date'] || '';
              description = row['Particulars'] || '';
              reference = row['Chq No'] || '';
              debit = parseAmount(row['Withdrawal']);
              credit = parseAmount(row['Deposit']);
              balance = parseAmount(row['Balance']);
              break;

            case 'generic':
            default:
              dateStr = row['Date'] || row['date'] || '';
              description = row['Description'] || row['description'] || row['Particulars'] || row['particulars'] || '';
              const amtGeneric = parseAmount(row['Amount'] || row['amount'] || row['Amt'] || row['amt']);
              const typeGeneric = String(row['Type'] || row['type'] || '').toLowerCase();
              
              if (typeGeneric.includes('inc') || typeGeneric.includes('cr') || amtGeneric > 0) {
                credit = Math.abs(amtGeneric);
              } else {
                debit = Math.abs(amtGeneric);
              }
              balance = parseAmount(row['Balance'] || row['balance']);
              break;
          }
        }

        // Clean values
        description = description.trim() || 'Transaction';
        reference = reference.trim();
        const rowDate = parseDate(dateStr);
        debit = Math.abs(debit);
        credit = Math.abs(credit);

        // Validation checks
        const isValidDate = !isNaN(rowDate.getTime());
        const hasAmount = debit > 0 || credit > 0;
        const isValid = isValidDate && hasAmount;

        let errorMessage = undefined;
        if (!isValidDate) errorMessage = 'Invalid Date Format';
        else if (!hasAmount) errorMessage = 'Missing Transaction Amount';

        type = detectTransactionType(description, debit, credit);
        const { category, icon } = autoCategorize(description, type);

        return {
          date: rowDate,
          description,
          reference,
          debit,
          credit,
          amount: type === 'income' ? credit : debit,
          type,
          category,
          icon,
          balance,
          isValid,
          errorMessage,
        };
      } catch (err: any) {
        return {
          date: new Date(),
          description: 'Error row',
          reference: '',
          debit: 0,
          credit: 0,
          amount: 0,
          type: 'expense' as TransactionType,
          category: 'Other',
          icon: '📦',
          balance: 0,
          isValid: false,
          errorMessage: err?.message || String(err),
        };
      }
    })
    .filter(row => row.description !== ''); // Filter out completely empty lines
}
