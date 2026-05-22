'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DataManagement } from '@/components/data-management';
import { isBiometricAvailable, promptBiometricAuth } from '@/src/native/biometrics';

const BIOMETRIC_STORAGE_KEY = 'pfos.biometricEnabled';

export default function SettingsPage() {
  const { user, signOut } = useAuthContext();
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('English');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initializeBiometrics = async () => {
      try {
        const available = await isBiometricAvailable();
        if (!active) return;
        const storedEnabled = typeof window !== 'undefined' ? window.localStorage.getItem(BIOMETRIC_STORAGE_KEY) === 'true' : false;
        setBiometricAvailable(available);
        setBiometricLock(available && storedEnabled);
      } catch (error) {
        console.warn('Biometrics initialization failed', error);
        if (active) setBiometricAvailable(false);
      } finally {
        if (active) setBiometricLoading(false);
      }
    };

    void initializeBiometrics();
    return () => {
      active = false;
    };
  }, []);

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!enabled) {
      setBiometricLock(false);
      if (typeof window !== 'undefined') window.localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'false');
      return;
    }

    const verified = await promptBiometricAuth();
    if (verified) {
      setBiometricLock(true);
      if (typeof window !== 'undefined') window.localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
    } else {
      setBiometricLock(false);
      if (typeof window !== 'undefined') window.localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'false');
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Logout?');
    if (confirmed) {
      await signOut();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-secondary">Configure account, preferences, notifications, security, and data tools.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Account</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Profile</label>
              <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                {user?.displayName || 'Unnamed user'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Email</label>
              <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                {user?.email || 'Not available'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Change password</label>
              <Button variant="outline" size="sm" className="w-full">
                Update password
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Dark mode</p>
                <p className="text-xs text-secondary">Toggle your theme preference</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Currency</label>
              <select
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Language</label>
              <select
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Budget alerts</p>
                <p className="text-xs text-secondary">Receive budget threshold notifications</p>
              </div>
              <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Reminders</p>
                <p className="text-xs text-secondary">Enable scheduled reminders</p>
              </div>
              <Switch checked={reminders} onCheckedChange={setReminders} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Goal alerts</p>
                <p className="text-xs text-secondary">Get updates on goal progress</p>
              </div>
              <Switch checked={goalAlerts} onCheckedChange={setGoalAlerts} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Biometric lock</p>
                <p className="text-xs text-secondary">
                  {biometricLoading
                    ? 'Detecting biometric support…'
                    : biometricAvailable
                    ? 'Use device biometrics to secure app settings and session access.'
                    : 'Biometric authentication is not available on this device.'}
                </p>
              </div>
              <Switch checked={biometricLock} onCheckedChange={handleBiometricToggle} disabled={!biometricAvailable || biometricLoading} />
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-secondary">
              Session management coming soon. Sign out to end this session.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              Delete account
            </Button>
          </div>
        </div>
      </section>

      <section>
        <DataManagement />
      </section>
    </div>
  );
}
