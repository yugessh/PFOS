import AnalyticsHub from '@/src/components/analytics/AnalyticsHub';

type AnalyticsTab = 'overview' | 'reports' | 'stats' | 'insights';

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab: AnalyticsTab =
    searchParams?.tab === 'reports' || searchParams?.tab === 'stats' || searchParams?.tab === 'insights'
      ? searchParams.tab
      : 'overview';

  return <AnalyticsHub initialTab={initialTab} />;
}
