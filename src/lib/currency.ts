/**
 * Currency formatting utilities with precise decimal handling
 * Supports Indian Rupee and other major currencies
 */

/**
 * Format amount as currency with proper thousands separator and decimal places
 * Preserves exact decimal precision (paise/cents)
 * 
 * Examples:
 * - 1250.50 → "₹1,250.50"
 * - 99.99 → "₹99.99"
 * - 50000 → "₹50,000.00"
 * - 12.75 → "₹12.75"
 */
export function formatCurrency(
  amount: number | string,
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR'
): string {
  // Convert to number if string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid amounts
  if (isNaN(num)) return `${getCurrencySymbol(currency)}0.00`;
  
  // Format with exact decimal places
  const currencySymbol = getCurrencySymbol(currency);
  const formatter = new Intl.NumberFormat(getCurrencyLocale(currency), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${currencySymbol}${formatter.format(num)}`;
}

/**
 * Format amount as compact currency (with K/M suffix for large numbers)
 * Useful for dashboard summaries where space is limited
 * 
 * Examples:
 * - 1250.50 → "₹1.25K"
 * - 99.99 → "₹100"
 * - 50000 → "₹50K"
 * - 1500000 → "₹1.5M"
 */
export function formatCurrencyCompact(
  amount: number | string,
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return `${getCurrencySymbol(currency)}0`;
  
  const currencySymbol = getCurrencySymbol(currency);
  const absNum = Math.abs(num);
  
  // Determine suffix and divisor
  let suffix = '';
  let divisor = 1;
  
  if (absNum >= 1000000) {
    suffix = 'M';
    divisor = 1000000;
  } else if (absNum >= 1000) {
    suffix = 'K';
    divisor = 1000;
  }
  
  // Format the divided number
  const divided = num / divisor;
  
  // Determine decimal places
  let decimalPlaces = 0;
  if (suffix !== '') {
    // For K/M suffix, show 2 decimal places if needed
    const fractionalPart = Math.abs(divided) % 1;
    decimalPlaces = fractionalPart !== 0 ? 2 : 0;
  }
  
  const formatter = new Intl.NumberFormat(getCurrencyLocale(currency), {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });
  
  return `${currencySymbol}${formatter.format(divided)}${suffix}`;
}

/**
 * Format amount as simple numeric string with proper decimal handling
 * Useful for form inputs and calculations
 * 
 * Examples:
 * - 1250.50 → "1250.50"
 * - 99.99 → "99.99"
 * - 50000.75 → "50000.75"
 */
export function formatNumeric(amount: number | string, decimalPlaces: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0.00';
  
  // Preserve exact decimal places without rounding loss
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Parse currency string to number safely
 * Handles various formats
 * 
 * Examples:
 * - "₹1,250.50" → 1250.50
 * - "1250.50" → 1250.50
 * - "$99.99" → 99.99
 */
export function parseCurrency(currencyStr: string): number {
  if (!currencyStr) return 0;
  
  // Remove currency symbols
  let cleaned = currencyStr
    .replace(/[₹$€£]/g, '')
    .replace(/K$|M$/, '') // Remove K/M suffix
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculate percentage with proper decimal handling
 * 
 * Examples:
 * - (150, 200) → "75.00"
 * - (50, 100) → "50.00"
 */
export function calculatePercentage(part: number, total: number, decimalPlaces: number = 2): string {
  if (total === 0) return '0.00';
  
  const percentage = (part / total) * 100;
  return percentage.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Calculate percentage value
 * Examples:
 * - (100, 50) → 50 (50% of 100)
 * - (1000, 10) → 100 (10% of 1000)
 */
export function getPercentageValue(total: number, percentage: number): number {
  return (total * percentage) / 100;
}

/**
 * Format a difference amount with + or - prefix
 * Useful for showing changes
 * 
 * Examples:
 * - 250.50 → "+₹250.50"
 * - -100.00 → "-₹100.00"
 */
export function formatDifference(amount: number, currency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR'): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
}

/**
 * Round amount to nearest paise/cent
 * Prevents floating point arithmetic errors
 * 
 * Examples:
 * - 99.999 → 100.00
 * - 99.994 → 99.99
 */
export function roundToDecimal(amount: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(amount * factor) / factor;
}

/**
 * Add amounts with proper decimal precision
 * Prevents floating point errors like 0.1 + 0.2 = 0.30000000000000004
 */
export function addAmounts(amounts: number[]): number {
  const factor = 100; // Work with paise/cents
  const sum = amounts.reduce((acc, val) => acc + Math.round(val * factor), 0);
  return roundToDecimal(sum / factor, 2);
}

/**
 * Subtract amounts with proper decimal precision
 */
export function subtractAmounts(minuend: number, subtrahend: number): number {
  return roundToDecimal(minuend - subtrahend, 2);
}

// Helper functions

function getCurrencySymbol(currency: 'INR' | 'USD' | 'EUR' | 'GBP'): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || '₹';
}

function getCurrencyLocale(currency: 'INR' | 'USD' | 'EUR' | 'GBP'): string {
  const locales: Record<string, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };
  return locales[currency] || 'en-IN';
}
