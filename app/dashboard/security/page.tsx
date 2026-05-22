'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSecurityContext, type MaskingOptionKey } from '@/src/context/SecurityContext';
import type { SecuritySession, SecurityAuditLog } from '@/src/types/firestore';

export default function SecurityPage() {
  const {
    hasPin,
    appLockEnabled,
    pinLength,
    privacyModeEnabled,
    sessionTimeout,
    maskingOptions,
    recentSessions,
    auditLogs,
    setAppLockEnabled,
    setPinLength,
    setSessionTimeout,
    togglePrivacyMode,
    setMaskingOption,
    logoutOtherDevices,
    setPin,
  } = useSecurityContext() as any;

  const [pinEntry, setPinEntry] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSavePin = async () => {
    if (!pinEntry || (pinEntry.length !== pinLength && pinEntry.length !== 6 && pinEntry.length !== 4)) {
      setSaveStatus(`Enter a ${pinLength}-digit PIN`);
      return;
    }
    const success = await setPin(pinEntry);
    setSaveStatus(success ? 'PIN saved successfully' : 'Failed to save PIN');
    if (success) setPinEntry('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security</h1>
        <p className="text-sm text-secondary">Manage app lock, privacy masking, session activity, and audit history.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">App Lock</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">App lock</p>
                <p className="text-xs text-secondary">Require PIN to reopen the app.</p>
              </div>
              <Switch checked={appLockEnabled} onCheckedChange={setAppLockEnabled} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${pinLength === 4 ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground'}`}
                onClick={() => setPinLength(4)}
              >
                4-digit PIN
              </button>
              <button
                type="button"
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${pinLength === 6 ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground'}`}
                onClick={() => setPinLength(6)}
              >
                6-digit PIN
              </button>
            </div>
            <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
              <label className="text-sm font-medium text-foreground">PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={pinLength}
                value={pinEntry}
                onChange={(event) => setPinEntry(event.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                placeholder={`${pinLength}-digit PIN`}
              />
              <Button onClick={handleSavePin} className="w-full">
                Save PIN
              </Button>
              {saveStatus ? <p className="text-sm text-secondary">{saveStatus}</p> : null}
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-secondary">
              {hasPin ? 'PIN lock is configured. Use the unlock screen when the app is locked.' : 'No PIN configured yet. Save a PIN to enable app locking.'}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Privacy</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Privacy mode</p>
                <p className="text-xs text-secondary">Mask sensitive values across the app.</p>
              </div>
              <Switch checked={privacyModeEnabled} onCheckedChange={togglePrivacyMode} />
            </div>
            {Object.entries(maskingOptions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{key}</p>
                  <p className="text-xs text-secondary">Mask {key} values in dashboards.</p>
                </div>
                <Switch checked={Boolean(value)} onCheckedChange={(next) => setMaskingOption(key as MaskingOptionKey, next)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Session timeout</h2>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {['1', '5', '15', '30', 'never'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium ${sessionTimeout === option ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground'}`}
                  onClick={() => setSessionTimeout(option as any)}
                >
                  {option === 'never' ? 'Never' : `${option} min`}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-secondary">
              Inactivity will lock the app after the selected timeout.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Session management</h2>
          <div className="space-y-4">
            <Button onClick={logoutOtherDevices} className="w-full">
              Log out other devices
            </Button>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-secondary">
              Active sessions and audit history are listed below.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent sessions</h2>
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <p className="text-sm text-secondary">No recent sessions yet.</p>
            ) : (
              recentSessions.map((session: SecuritySession) => (
                <div key={session.id} className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="font-medium text-foreground">{typeof session.deviceInfo === 'string' ? session.deviceInfo : (session.deviceInfo as any)?.name || 'Unknown device'}</p>
                  <p className="text-xs text-secondary">{new Date(session.updatedAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Audit log</h2>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-secondary">No audit events available.</p>
            ) : (
              auditLogs.slice(0, 6).map((log: SecurityAuditLog) => (
                <div key={log.id} className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="font-medium text-foreground">{log.eventType}</p>
                  <p className="text-xs text-secondary">{log.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
