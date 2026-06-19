import { describe, it, expect } from 'vitest';
import { calculateEMIProgress, getEMIAlerts } from './emi';

// Helper to create a base EMI model
function baseEmi(overrides = {}): any {
  return {
    id: 'emi1',
    userId: 'u1',
    title: 'Test EMI',
    loanAmount: 100000,
    monthlyInstallment: 5000,
    totalInstallments: 12,
    paidInstallments: 0,
    dueDate: 15,
    accountId: 'acc1',
    category: 'loan',
    startDate: new Date('2024-01-01'),
    reminderDaysBefore: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

describe('calculateEMIProgress', () => {
  it('calculates normal progress', () => {
    const emi = baseEmi({ paidInstallments: 3, startDate: new Date('2024-01-01') });
    const now = new Date('2024-04-15');
    // Mock current date
    vi.setSystemTime(now);
    const progress = calculateEMIProgress(emi);
    expect(progress.paid).toBe(3);
    expect(progress.remaining).toBe(9);
    // months elapsed from Jan to Apr inclusive = 4
    expect(progress.monthsElapsed).toBe(4);
    expect(progress.progress).toBeCloseTo((3 / 12) * 100);
    expect(progress.isCompleted).toBe(false);
  });

  it('caps paidInstallments at totalInstallments', () => {
    const emi = baseEmi({ paidInstallments: 10, totalInstallments: 6 });
    const progress = calculateEMIProgress(emi);
    expect(progress.paid).toBe(6);
    expect(progress.remaining).toBe(0);
    expect(progress.isCompleted).toBe(true);
    expect(progress.progress).toBe(100);
  });

  it('handles zero totalInstallments gracefully', () => {
    const emi = baseEmi({ totalInstallments: 0, paidInstallments: 0 });
    const progress = calculateEMIProgress(emi);
    expect(progress.total).toBe(0);
    expect(Number.isNaN(progress.progress)).toBe(true);
    expect(progress.isCompleted).toBe(true);
  });

  it('handles negative paidInstallments', () => {
    const emi = baseEmi({ paidInstallments: -2, totalInstallments: 5 });
    const progress = calculateEMIProgress(emi);
    expect(progress.paid).toBe(-2);
    expect(progress.remaining).toBe(7);
    expect(progress.isCompleted).toBe(false);
  });
});

describe('getEMIAlerts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns alerts for upcoming due within reminderDaysBefore', () => {
    const now = new Date('2024-04-10');
    vi.setSystemTime(now);
    const emi = baseEmi({
      startDate: new Date('2024-01-01'),
      paidInstallments: 2,
      reminderDaysBefore: 5,
    });
    const alerts = getEMIAlerts([emi]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].isOverdue).toBe(false);
    expect(alerts[0].daysUntilDue).toBeLessThanOrEqual(5);
  });

  it('flags overdue EMIs', () => {
    const now = new Date('2024-04-20');
    vi.setSystemTime(now);
    const emi = baseEmi({
      startDate: new Date('2024-01-01'),
      paidInstallments: 1,
      reminderDaysBefore: 5,
    });
    const alerts = getEMIAlerts([emi]);
    expect(alerts[0].isOverdue).toBe(true);
    expect(alerts[0].daysUntilDue).toBeGreaterThan(0);
  });

  it('ignores inactive EMIs and completed EMIs', () => {
    const now = new Date('2024-04-10');
    vi.setSystemTime(now);
    const inactive = baseEmi({ isActive: false });
    const completed = baseEmi({ paidInstallments: 12, totalInstallments: 12 });
    const alerts = getEMIAlerts([inactive, completed]);
    expect(alerts).toHaveLength(0);
  });

  it('sorts multiple alerts by daysUntilDue ascending', () => {
    const now = new Date('2024-04-10');
    vi.setSystemTime(now);
    const emi1 = baseEmi({ paidInstallments: 2, reminderDaysBefore: 10 }); // due in ~5 days
    const emi2 = baseEmi({
      id: 'emi2',
      startDate: new Date('2024-01-01'),
      paidInstallments: 1,
      reminderDaysBefore: 30,
    }); // overdue alert
    const alerts = getEMIAlerts([emi2, emi1]);
    expect(alerts[0].daysUntilDue).toBeLessThanOrEqual(alerts[1].daysUntilDue);
  });
});
