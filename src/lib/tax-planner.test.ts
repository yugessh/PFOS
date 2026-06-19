import { describe, it, expect } from 'vitest';
import {
  currentIndiaFY,
  summarizeDeductions,
  estimateTaxIndia,
  estimateTax,
  analyzeTaxSavings,
} from './tax-planner';

describe('currentIndiaFY', () => {
  it('returns FY starting year when month is before April', () => {
    const fy = currentIndiaFY(new Date('2024-03-15'));
    expect(fy).toEqual({ startYear: 2023, endYear: 2024, label: '2023-24' });
  });
  it('returns FY starting year when month is April or later', () => {
    const fy = currentIndiaFY(new Date('2024-04-10'));
    expect(fy).toEqual({ startYear: 2024, endYear: 2025, label: '2024-25' });
  });
});

describe('summarizeDeductions', () => {
  it('includes all default keys with zero when not provided', () => {
    const summary = summarizeDeductions();
    const keys = Object.keys(summary).map((s) => s);
    expect(summary.find((d) => d.id === '80C')?.used).toBe(0);
  });
  it('uses provided deduction values', () => {
    const summary = summarizeDeductions({ '80C': 50000 });
    const d80C = summary.find((d) => d.id === '80C');
    expect(d80C?.used).toBe(50000);
  });
});

describe('estimateTaxIndia', () => {
  const testCases = [
    { income: 250000, expected: 0 },
    { income: 250001, expected: 0 }, // rounding of 0.05% of 1 => 0 after Math.round
    { income: 500000, expected: 12500 },
    { income: 500001, expected: 12500 },
    { income: 750000, expected: 37500 },
    { income: 750001, expected: 37500 },
    { income: 1000000, expected: 75000 },
    { income: 1500000, expected: 187500 },
    { income: 10000000, expected: 2737500 },
  ];
  testCases.forEach(({ income, expected }) => {
    it(`calculates tax for taxable income ${income}`, () => {
      expect(estimateTaxIndia(income)).toBe(expected);
    });
  });
});

describe('estimateTax', () => {
  it('returns zero tax for zero incomes', () => {
    const result = estimateTax({ salaryIncome: 0 });
    expect(result).toEqual({
      grossIncome: 0,
      totalDeductions: 0,
      taxableIncome: 0,
      estimatedTax: 0,
      netIncome: 0,
    });
  });
  it('calculates tax with deductions exceeding gross', () => {
    const result = estimateTax({ salaryIncome: 500000, deductions: { '80C': 600000 } });
    expect(result.taxableIncome).toBe(0);
    expect(result.estimatedTax).toBe(0);
  });
  it('calculates tax for mixed incomes', () => {
    const inputs = {
      salaryIncome: 500000,
      businessIncome: 200000,
      investmentIncome: 100000,
      deductions: { '80C': 50000 },
    };
    const result = estimateTax(inputs);
    // gross = 800k, deductions = 50k, taxable = 750k => tax according to slabs = 37500
    expect(result.grossIncome).toBe(800000);
    expect(result.taxableIncome).toBe(750000);
    expect(result.estimatedTax).toBe(37500);
    expect(result.netIncome).toBe(800000 - 37500);
  });
});

describe('analyzeTaxSavings', () => {
  it('suggests savings for unused deduction limits', () => {
    const { suggestions } = analyzeTaxSavings({ '80C': 50000 });
    // 80C limit 150k, remaining 100k => suggestion should contain 80C
    expect(suggestions.some((s) => s.includes('80C'))).toBe(true);
  });
  it('does not suggest when all limits are fully used', () => {
    const full = {
      '80C': 150000,
      '80D': 25000,
      homeLoanInterest: 200000,
      educationLoanInterest: 150000,
      nps: 50000,
    };
    const { suggestions } = analyzeTaxSavings(full);
    expect(suggestions).toHaveLength(0);
  });
});
