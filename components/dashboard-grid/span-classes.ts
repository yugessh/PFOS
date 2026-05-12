import type { DashboardRowSpan, DashboardSpan } from './types';

/** Mobile-first: full width on small screens; `md` uses 6 cols; `lg` uses 12 cols. */
export const dashboardColSpanClass: Record<DashboardSpan, string> = {
  1: 'col-span-1 md:col-span-1 lg:col-span-1',
  2: 'col-span-1 md:col-span-1 lg:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
  4: 'col-span-1 md:col-span-2 lg:col-span-4',
  5: 'col-span-1 md:col-span-3 lg:col-span-5',
  6: 'col-span-1 md:col-span-3 lg:col-span-6',
  7: 'col-span-1 md:col-span-4 lg:col-span-7',
  8: 'col-span-1 md:col-span-4 lg:col-span-8',
  9: 'col-span-1 md:col-span-5 lg:col-span-9',
  10: 'col-span-1 md:col-span-5 lg:col-span-10',
  11: 'col-span-1 md:col-span-6 lg:col-span-11',
  12: 'col-span-1 md:col-span-6 lg:col-span-12',
};

export const dashboardFullWidthColClass =
  'col-span-1 md:col-span-6 lg:col-span-12';

export const dashboardRowSpanClass: Record<DashboardRowSpan, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
};
