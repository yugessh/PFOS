/**
 * Tax planner: estimators, financial year handling, deduction helpers
 * Lightweight, framework-agnostic, pure functions.
 */

export type Currency = 'INR' | 'USD' | string;

export interface TaxInputs {
  salaryIncome: number;
  businessIncome?: number;
  investmentIncome?: number;
  tradingIncome?: number;
  otherIncome?: number;
  deductions?: Record<string, number>;
}

export interface TaxBreakdown {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
  netIncome: number;
}

export interface DeductionSummary {
  id: string;
  label: string;
  used: number;
  limit: number;
}

export interface FYRange { startYear: number; endYear: number; label: string }

export function currentIndiaFY(date = new Date()): FYRange {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  if (month >= 4) {
    return { startYear: year, endYear: year + 1, label: `${year}-${String(year + 1).slice(-2)}` };
  }
  return { startYear: year - 1, endYear: year, label: `${year - 1}-${String(year).slice(-2)}` };
}

export const DEFAULT_DEDUCTION_LIMITS: Record<string, number> = {
  '80C': 150000,
  '80D': 25000,
  'homeLoanInterest': 200000,
  'educationLoanInterest': 150000,
  'nps': 50000,
};

export function summarizeDeductions(deductions: Record<string, number> = {}) : DeductionSummary[] {
  return Object.keys(DEFAULT_DEDUCTION_LIMITS).map((k) => ({ id: k, label: k, used: deductions[k] || 0, limit: DEFAULT_DEDUCTION_LIMITS[k] }));
}

// Very simplified Indian tax slab estimator (example only) — progressive slabs
export function estimateTaxIndia(taxableIncome: number): number {
  if (taxableIncome <= 250000) return 0;
  let remaining = taxableIncome;
  let tax = 0;
  const slabs = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 750000, rate: 0.1 },
    { upto: 1000000, rate: 0.15 },
    { upto: 1250000, rate: 0.2 },
    { upto: 1500000, rate: 0.25 },
    { upto: Infinity, rate: 0.3 },
  ];

  let lower = 0;
  for (const slab of slabs) {
    const slabUpper = Math.min(slab.upto, taxableIncome);
    if (slabUpper > lower) {
      const amount = slabUpper - lower;
      tax += amount * (slab.rate);
    }
    lower = slab.upto;
    if (lower >= taxableIncome) break;
  }

  // rebate and cess approximations not included — keep simple
  return Math.max(0, Math.round(tax));
}

export function estimateTax(inputs: TaxInputs): TaxBreakdown {
  const gross = (inputs.salaryIncome || 0) + (inputs.businessIncome || 0) + (inputs.investmentIncome || 0) + (inputs.tradingIncome || 0) + (inputs.otherIncome || 0);
  const totalDeductions = Object.values(inputs.deductions || {}).reduce((s, v) => s + (v || 0), 0);
  const taxable = Math.max(0, gross - totalDeductions);
  const estimatedTax = estimateTaxIndia(taxable);
  const netIncome = gross - estimatedTax;
  return { grossIncome: gross, totalDeductions, taxableIncome: taxable, estimatedTax, netIncome };
}

export function analyzeTaxSavings(deductions: Record<string, number> = {}) {
  const summary = summarizeDeductions(deductions);
  const suggestions: string[] = [];
  for (const s of summary) {
    const remaining = s.limit - s.used;
    if (remaining > 0) suggestions.push(`You can save using ${s.label}: ₹${remaining.toLocaleString()}`);
  }
  return { summary, suggestions };
}
