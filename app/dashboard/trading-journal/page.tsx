'use client';

export default function TradingJournalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trading Journal</h1>
        <p className="text-muted-foreground">Track your trading activity and performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
          <p className="text-2xl font-bold text-card-foreground">24</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
          <p className="text-2xl font-bold text-green-600">62.5%</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">P&L</p>
          <p className="text-2xl font-bold text-primary">+₹85K</p>
        </div>
      </div>
    </div>
  );
}
