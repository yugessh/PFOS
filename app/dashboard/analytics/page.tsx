import React from 'react';
import AnalyticsHub from '@/src/components/analytics/AnalyticsHub';

type AnalyticsTab = 'overview' | 'reports' | 'stats' | 'insights';

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = searchParams ? React.use(searchParams) : undefined;
  const initialTab: AnalyticsTab =
    resolved?.tab === 'reports' || resolved?.tab === 'stats' || resolved?.tab === 'insights'
      ? resolved.tab
      : 'overview';

  return <AnalyticsHub initialTab={initialTab} />;
}
