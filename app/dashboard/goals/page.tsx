'use client';

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
        <p className="text-muted-foreground">Plan and track your financial goals.</p>
      </div>

      <div className="bg-primary text-primary-foreground rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Overall Progress</h2>
        <p className="text-primary-foreground/80">65% toward all goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Goals</p>
          <p className="text-3xl font-bold text-card-foreground">8</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">3</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">In Progress</p>
          <p className="text-3xl font-bold text-primary">5</p>
        </div>
      </div>
    </div>
  );
}
