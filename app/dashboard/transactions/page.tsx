'use client';

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">View and manage all your financial transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-3xl font-bold text-green-600">₹150K</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">₹85K</p>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-bold text-foreground">Transaction List</h2>
        <p className="text-muted-foreground mt-2">Transactions coming soon...</p>
      </div>
    </div>
  );
}
