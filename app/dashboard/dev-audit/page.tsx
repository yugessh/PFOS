"use client"
import React, { useState } from "react";
import { getAuthSafe, initializeFirebase } from "@/src/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import DevAuditService from "@/src/services/dev-audit.service";
import { notificationsService } from "@/src/services/firestore/notifications.service";
import DevTestsService from '@/src/services/dev-tests.service';

initializeFirebase();

export default function DevAuditPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return <div className="p-6">Dev Audit is disabled in production.</div>;
  }

  const makeTestCredentials = () => {
    const ts = Date.now();
    const email = `audit+${ts}@example.com`;
    const password = `Audit!${ts}`;
    return { email, password };
  };

  const createAndSeed = async () => {
    setRunning(true);
    setStatus("Creating test user...");
    try {
      const auth = getAuthSafe();
      if (!auth) throw new Error("Auth not initialized");
      const creds = makeTestCredentials();
      const userCred = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
      await updateProfile(userCred.user, { displayName: "Audit Tester" });
      setStatus("Seeding test data...");
      const result = await DevAuditService.seedForUser(userCred.user.uid, (prog) => {
        setStatus(`Seeding progress - ${prog}`);
      });
      setStatus(`Done. Created seed for user ${userCred.user.uid}. Results: ${JSON.stringify(result)}`);
    } catch (err: any) {
      setStatus(`Error: ${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  const simulateNotification = async (type: string, title: string, message: string) => {
    setRunning(true);
    setStatus(`Creating notification: ${type}`);
    try {
      const auth = getAuthSafe();
      if (!auth || !auth.currentUser) throw new Error('Not signed in');
      const userId = auth.currentUser.uid;
      const id = await notificationsService.createNotification(userId, type as any, title, message, 'medium', { from: 'dev-audit' });
      setStatus(`Created notification ${id}`);
    } catch (err: any) {
      setStatus(`Error creating notification: ${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  const runFirebaseDiagnostics = async () => {
    setRunning(true);
    setStatus('Running Firebase diagnostics...');
    try {
      const auth = getAuthSafe();
      if (!auth || !auth.currentUser) throw new Error('Not signed in');
      const userId = auth.currentUser.uid;
      // Read check
      try {
        const list = await notificationsService.getUserNotifications(userId);
        if (Array.isArray(list)) setStatus((s) => `${s}\nRead: PASS (${list.length} notifications)`);
        else setStatus((s) => `${s}\nRead: PASS`);
      } catch (e: any) {
        setStatus((s) => `${s}\nRead: FAIL - ${e?.message || String(e)}`);
      }
      // Write check
      try {
        const nid = await notificationsService.createNotification(userId, 'system_alert' as any, 'Diag Test', 'Diagnostics write test', 'low', { diag: true });
        setStatus((s) => `${s}\nWrite: PASS (id:${nid})`);
      } catch (e: any) {
        setStatus((s) => `${s}\nWrite: FAIL - ${e?.message || String(e)}`);
      }
      // Listener check (start and immediate unsubscribe)
      try {
        const unsub = notificationsService.subscribeToUserNotifications(userId, false, () => {});
        unsub();
        setStatus((s) => `${s}\nListeners: PASS`);
      } catch (e: any) {
        setStatus((s) => `${s}\nListeners: FAIL - ${e?.message || String(e)}`);
      }
    } catch (err: any) {
      setStatus(`Diagnostics failed: ${err?.message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Developer Audit Mode</h1>
      <p className="mb-4">This page is only available in development and is disabled in production.</p>
      <div className="flex gap-3 mb-4">
        <button className="px-4 py-2 bg-slate-800 text-white rounded" onClick={createAndSeed} disabled={running}>
          Generate Test User & Seed Data
        </button>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Production Readiness</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-violet-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running static data detector...');
            try {
              const res = await fetch('/api/audit/scan');
              const json = await res.json();
              setStatus(JSON.stringify(json, null, 2));
            } catch (e: any) {
              setStatus(String(e?.message || e));
            } finally { setRunning(false); }
          }} disabled={running}>Run Static Data Detector</button>

          <button className="px-3 py-1 bg-fuchsia-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Computing readiness...');
            try {
              const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required');
              const res = await (await fetch(`/api/internal/readiness?uid=${auth.currentUser.uid}`)).json();
              setStatus(JSON.stringify(res, null, 2));
            } catch (e: any) {
              setStatus(String(e?.message || e));
            } finally { setRunning(false); }
          }} disabled={running}>Compute Readiness</button>

          <button className="px-3 py-1 bg-emerald-800 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Generating report...');
            try {
              const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required');
              const res = await (await fetch(`/api/internal/readiness?uid=${auth.currentUser.uid}`)).json();
              const mdParts: string[] = [];
              mdParts.push('# PFOS Production Readiness Report');
              mdParts.push('Generated: ' + new Date().toISOString());
              mdParts.push('\n## Overall: ' + (res.results?.overall ?? 'N/A') + '%\n');
              mdParts.push('```json');
              mdParts.push(JSON.stringify(res.results || {}, null, 2));
              mdParts.push('```');
              const content = mdParts.join('\n\n');
              const post = await fetch('/api/audit/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) });
              const j = await post.json();
              setStatus(JSON.stringify(j));
            } catch (e: any) { setStatus(String(e?.message || e)); } finally { setRunning(false); }
          }} disabled={running}>Generate Report (audit/production-readiness.md)</button>
        </div>
      </div>
      <div className="mt-4">
        <strong>Status:</strong>
        <div className="mt-2 font-mono text-sm break-all">{status || "Idle"}</div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Notification Simulator</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => simulateNotification('transaction_alert', 'Transaction', 'Test transaction occurred')} disabled={running}>Transaction</button>
          <button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={() => simulateNotification('budget_alert', 'Budget', 'Budget threshold reached')} disabled={running}>Budget</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => simulateNotification('goal_alert', 'Goal', 'Goal progress made')} disabled={running}>Goal</button>
          <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={() => simulateNotification('investment_alert', 'Investment', 'Investment updated')} disabled={running}>Investment</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => simulateNotification('security_alert', 'Security', 'Suspicious sign-in detected')} disabled={running}>Security</button>
          <button className="px-3 py-1 bg-gray-600 text-white rounded" onClick={() => simulateNotification('system_alert', 'System', 'System maintenance')} disabled={running}>System</button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Workflow Tester</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running transaction workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runTransactionWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Transaction Workflow</button>
          <button className="px-3 py-1 bg-rose-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running notification workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runNotificationWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Notification Workflow</button>
          <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Measuring realtime latency...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.measureRealtimeLatency(auth.currentUser.uid, 3); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Measure Realtime Latency</button>
          <button className="px-3 py-1 bg-yellow-600 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running budget workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runBudgetWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Budget Workflow</button>
          <button className="px-3 py-1 bg-yellow-700 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running goal workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runGoalWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Goal Workflow</button>
          <button className="px-3 py-1 bg-yellow-800 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running investment workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runInvestmentWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Investment Workflow</button>
          <button className="px-3 py-1 bg-indigo-800 text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running import workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runImportWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Import Workflow</button>
          <button className="px-3 py-1 bg-black text-white rounded" onClick={async () => {
            setRunning(true); setStatus('Running full system workflow...');
            try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runFullSystemWorkflow(auth.currentUser.uid); setStatus(JSON.stringify(res)); } catch (e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); }
          }} disabled={running}>Run Full System Workflow</button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Module Tester (quick checks)</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={async () => { setRunning(true); setStatus('Testing accounts module...'); try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runModuleCrudCheck(auth.currentUser.uid, 'accounts'); setStatus(JSON.stringify(res)); } catch(e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); } }} disabled={running}>Accounts</button>
          <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={async () => { setRunning(true); setStatus('Testing budgets module...'); try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runModuleCrudCheck(auth.currentUser.uid, 'budgets'); setStatus(JSON.stringify(res)); } catch(e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); } }} disabled={running}>Budgets</button>
          <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={async () => { setRunning(true); setStatus('Testing goals module...'); try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runModuleCrudCheck(auth.currentUser.uid, 'goals'); setStatus(JSON.stringify(res)); } catch(e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); } }} disabled={running}>Goals</button>
          <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={async () => { setRunning(true); setStatus('Testing investments module...'); try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runModuleCrudCheck(auth.currentUser.uid, 'investments'); setStatus(JSON.stringify(res)); } catch(e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); } }} disabled={running}>Investments</button>
          <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={async () => { setRunning(true); setStatus('Testing notifications module...'); try { const auth = getAuthSafe(); if (!auth?.currentUser) throw new Error('sign in required'); const res = await DevTestsService.runModuleCrudCheck(auth.currentUser.uid, 'notifications'); setStatus(JSON.stringify(res)); } catch(e:any){ setStatus(String(e?.message||e)); } finally { setRunning(false); } }} disabled={running}>Notifications</button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Firebase Diagnostics</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={runFirebaseDiagnostics} disabled={running}>Run Diagnostics</button>
        </div>
      </div>
    </div>
  );
}
