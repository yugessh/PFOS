'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and account.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-foreground">Theme</span>
              <span className="text-sm text-muted-foreground">Light/Dark</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-foreground">Notifications</span>
              <span className="text-sm text-muted-foreground">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-foreground">Currency</span>
              <span className="text-sm text-muted-foreground">INR</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Security</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>Security settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
