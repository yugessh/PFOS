'use client';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and download financial reports.</p>
      </div>
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Available Reports</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <span className="text-foreground">Monthly Summary</span>
            <span className="text-sm text-muted-foreground">May 2026</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <span className="text-foreground">Annual Report</span>
            <span className="text-sm text-muted-foreground">2025-2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
