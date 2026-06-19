import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/date';

describe('formatDate', () => {
  it('formats a standard date in UTC', () => {
    const d = new Date(Date.UTC(2024, 0, 5, 12, 30, 45)); // 2024-01-05
    expect(formatDate(d)).toBe('2024-01-05');
  });

  it('pads month and day with leading zeros', () => {
    const d = new Date(Date.UTC(2023, 9, 3)); // 2023-10-03
    expect(formatDate(d)).toBe('2023-10-03');
  });

  it('handles end of year rollover', () => {
    const d = new Date(Date.UTC(2022, 11, 31, 23, 59, 59)); // 2022-12-31
    expect(formatDate(d)).toBe('2022-12-31');
  });

  it('throws when passed a non‑Date object', () => {
    // @ts-ignore – intentionally invalid input
    const bad: any = {};
    expect(() => formatDate(bad)).toThrow();
  });
});
