import { redirect } from 'next/navigation';

export default function StatsPage() {
  redirect('/dashboard/analytics?tab=stats');
}
