'use client';

export default function InvestmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investments</h1>
        <p className="text-muted-foreground">Track and manage all your investments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
          <p className="text-2xl font-bold text-card-foreground">₹25L</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Current Value</p>
          <p className="text-2xl font-bold text-card-foreground">₹28L</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Returns</p>
          <p className="text-2xl font-bold text-green-600">₹3L</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Avg Return</p>
          <p className="text-2xl font-bold text-primary">12%</p>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground">Investment Portfolio</h2>
        <p className="text-muted-foreground mt-2">Portfolio details coming soon...</p>
      </div>
    </div>
  );
}
