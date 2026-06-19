import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumeric,
  parseCurrency,
  calculatePercentage,
  getPercentageValue,
  formatDifference,
  roundToDecimal,
  addAmounts,
  subtractAmounts,
} from './currency';

describe('formatCurrency', () => {
  it('formats positive number with two decimals', () => {
    expect(formatCurrency(1250.5)).toBe('₹1,250.50');
  });
  it('formats negative number', () => {
    expect(formatCurrency(-99.99)).toBe('₹-99.99');
  });
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });
  it('parses string input', () => {
    expect(formatCurrency('1250.5')).toBe('₹1,250.50');
  });
  it('returns 0.00 for invalid string', () => {
    expect(formatCurrency('abc')).toBe('₹0.00');
  });
  it('formats large number with separators', () => {
    expect(formatCurrency(12345678)).toBe('₹1,23,45,678.00');
  });
  it('supports USD locale', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });
});

describe('formatCurrencyCompact', () => {
  it('leaves numbers below 1000 unchanged', () => {
    expect(formatCurrencyCompact(999)).toBe('₹999');
  });
  it('adds K suffix', () => {
    expect(formatCurrencyCompact(1250)).toBe('₹1.25K');
  });
  it('adds M suffix for million', () => {
    expect(formatCurrencyCompact(1500000)).toBe('₹1.5M');
  });
  it('handles negative numbers', () => {
    expect(formatCurrencyCompact(-2000)).toBe('₹-2K');
  });
  it('handles zero', () => {
    expect(formatCurrencyCompact(0)).toBe('₹0');
  });
});

describe('formatNumeric', () => {
  it('formats with default 2 decimals', () => {
    expect(formatNumeric(1234.567)).toBe('1,234.57');
  });
  it('handles string input', () => {
    expect(formatNumeric('567.8')).toBe('567.80');
  });
  it('returns 0.00 for invalid input', () => {
    expect(formatNumeric('xyz' as any)).toBe('0.00');
  });
  it('respects custom decimalPlaces', () => {
    expect(formatNumeric(123.456, 0)).toBe('123');
  });
});

describe('parseCurrency', () => {
  it('parses INR with commas', () => {
    expect(parseCurrency('₹1,250.50')).toBe(1);
  });
  it('parses USD symbol', () => {
    expect(parseCurrency('$99.99')).toBe(99.99);
  });
  it('ignores K/M suffix', () => {
    expect(parseCurrency('1000K')).toBe(1000);
    expect(parseCurrency('2M')).toBe(2);
  });
  it('returns 0 for empty string', () => {
    expect(parseCurrency('')).toBe(0);
  });
  it('handles negative values', () => {
    expect(parseCurrency('-₹500')).toBe(-500);
  });
});

describe('calculatePercentage', () => {
  it('calculates normal percentage', () => {
    expect(calculatePercentage(150, 200)).toBe('75.00');
  });
  it('returns 0.00 when total is zero', () => {
    expect(calculatePercentage(5, 0)).toBe('0.00');
  });
  it('handles negative numbers', () => {
    expect(calculatePercentage(-50, 100)).toBe('-50.00');
  });
});

describe('getPercentageValue', () => {
  it('computes correct value', () => {
    expect(getPercentageValue(200, 25)).toBe(50);
  });
  it('handles zero total', () => {
    expect(getPercentageValue(0, 10)).toBe(0);
  });
  it('handles negative total', () => {
    expect(getPercentageValue(-100, 10)).toBe(-10);
  });
});

describe('formatDifference', () => {
  it('adds + for positive', () => {
    expect(formatDifference(250)).toBe('+₹250.00');
  });
  it('keeps - for negative', () => {
    expect(formatDifference(-100)).toBe('₹-100.00');
  });
});

describe('roundToDecimal', () => {
  it('rounds up correctly', () => {
    expect(roundToDecimal(99.995)).toBe(100);
  });
  it('rounds down correctly', () => {
    expect(roundToDecimal(99.994)).toBe(99.99);
  });
  it('handles negative numbers', () => {
    expect(roundToDecimal(-2.345, 2)).toBe(-2.35);
  });
});

describe('addAmounts', () => {
  it('adds array with floating point numbers correctly', () => {
    expect(addAmounts([0.1, 0.2])).toBeCloseTo(0.3);
  });
  it('handles empty array', () => {
    expect(addAmounts([])).toBe(0);
  });
  it('handles negative numbers', () => {
    expect(addAmounts([10, -4, 2])).toBe(8);
  });
});

describe('subtractAmounts', () => {
  it('subtracts with rounding', () => {
    expect(subtractAmounts(5, 3)).toBe(2);
    expect(subtractAmounts(5, 5.005)).toBeCloseTo(0);
  });
});
