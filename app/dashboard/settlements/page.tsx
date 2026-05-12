'use client';

export default function SettlementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settlements</h1>
        <p className="text-muted-foreground">View dividends, claims, and refunds.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Dividends</p>
          <p className="text-2xl font-bold text-green-600">₹15K</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Pending Claims</p>
          <p className="text-2xl font-bold text-orange-600">3</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Refunds Received</p>
          <p className="text-2xl font-bold text-blue-600">₹5K</p>
        </div>
      </div>
    </div>
  );
}
