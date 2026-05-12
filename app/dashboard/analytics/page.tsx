'use client';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Financial insights and performance metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Spending Trends</h2>
          <p className="text-muted-foreground">Analytics charts coming soon...</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Income Analysis</h2>
          <p className="text-muted-foreground">Income analytics coming soon...</p>
        </div>
      </div>
    </div>
  );
}
