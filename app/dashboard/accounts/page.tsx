'use client';

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
        <p className="text-muted-foreground">Manage all your financial accounts in one place.</p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground">Your Accounts</h2>
        <p className="text-muted-foreground mt-2">Account management coming soon...</p>
      </div>
    </div>
  );
}
