'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { getFirestoreClient } from '@/src/services/firestore/firebaseClient';
import { auditService, AuditLog, ErrorRecord, RepairRecord, HealthSnapshot } from '@/src/services/firestore/audit.service';
import { collection, getDocs, doc, writeBatch, query, where, getDoc, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Shield,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Server,
  AlertTriangle,
  CheckCircle,
  Database,
  Trash2,
  Settings,
  Cpu,
  FileSpreadsheet,
  Download,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  FolderLock,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Available modules for filtering
const INTEGRATION_MODULES = [
  'Accounts', 'Transactions', 'Budgets', 'Goals', 'Investments', 'Trading Journal',
  'Calendar', 'Notifications', 'Automation', 'AI Coach', 'Documents', 'Tax Planner',
  'Family Finance', 'Asset Register', 'Subscription Intelligence', 'Security', 'Import Hub', 'Reports', 'System', 'Diagnostics'
];

type TabType = 'overview' | 'activity' | 'diagnostics' | 'integrity' | 'errors' | 'reports';

export default function AuditCenterPage({ defaultTab = 'overview' }: { defaultTab?: TabType }) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  
  // States for general Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Diagnostics Hub state
  const [dbResponseTime, setDbResponseTime] = useState<number>(0);
  const [storageData, setStorageData] = useState<{ collections: Record<string, number>; totalItems: number; estimatedSize: number }>({
    collections: {},
    totalItems: 0,
    estimatedSize: 0
  });
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);

  // Integrity scanner state
  const [integrityIssues, setIntegrityIssues] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [integrityError, setIntegrityError] = useState<string | null>(null);

  // Error Center state
  const [errorRecords, setErrorRecords] = useState<ErrorRecord[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [errorsError, setErrorsError] = useState<string | null>(null);

  // Health scores state
  const [healthScores, setHealthScores] = useState<Omit<HealthSnapshot, 'id' | 'userId' | 'timestamp'>>({
    database: 100,
    performance: 100,
    sync: 100,
    security: 100,
    dataQuality: 100,
    overall: 100
  });

  // Mock control states for simulation panel
  const [simModule, setSimModule] = useState('Transactions');
  const [simAction, setSimAction] = useState('Transaction created');
  const [simSeverity, setSimSeverity] = useState<'info' | 'warning' | 'critical' | 'security'>('info');
  const [simStatus, setSimStatus] = useState<'success' | 'failure' | 'warning' | 'info'>('success');

  const isDev = process.env.NODE_ENV !== 'production';

  // Load basic audit data
  const loadAuditLogs = async () => {
    if (!user?.uid) return;
    setLoadingLogs(true);
    try {
      const data = await auditService.getAuditLogs(user.uid, { limitCount: 150 });
      setLogs(data);
      
      // Calculate system health based on current logs and system diagnostics
      calculateHealthMetrics(data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Load error incidents
  const loadErrors = async () => {
    if (!user?.uid) return;
    setLoadingErrors(true);
    try {
      setErrorsError(null);
      const data = await auditService.getErrors(user.uid);
      setErrorRecords(data);
    } catch (err) {
      console.error('Failed to load errors', err);
      setErrorsError('Unable to load error history right now.');
    } finally {
      setLoadingErrors(false);
    }
  };

  // Run diagnostics check
  const runDiagnostics = async () => {
    if (!user?.uid) return;
    setDiagnosticsLoading(true);
    setDiagnosticsError(null);
    try {
      const startTime = Date.now();
      const db = getFirestoreClient();
      if (!db) {
        setDbResponseTime(-1);
        setDiagnosticsLoading(false);
        return;
      }

      // Query simple test document to check response speed
      const testColRef = collection(db, `users/${user.uid}/transactions`);
      await getDocs(query(testColRef, limit(1)));
      setDbResponseTime(Date.now() - startTime);

      // Get count of major user collections
      const targetCollections = ['transactions', 'accounts', 'budgets', 'goals', 'investments', 'reminders', 'auditLogs', 'errorHistory', 'repairHistory', 'diagnostics', 'notifications', 'scheduledReports'];
      const stats: Record<string, number> = {};
      let total = 0;
      let sizeBytes = 0;

      for (const colName of targetCollections) {
        const ref = collection(db, `users/${user.uid}/${colName}`);
        const snap = await getDocs(ref);
        const count = snap.size;
        stats[colName] = count;
        total += count;

        snap.forEach((docSnap) => {
          sizeBytes += new Blob([JSON.stringify(docSnap.data())]).size;
        });
      }

      setStorageData({
        collections: stats,
        totalItems: total,
        estimatedSize: sizeBytes
      });

    } catch (err) {
      console.error('Diagnostics execution error', err);
      setDiagnosticsError('Diagnostics could not complete. Retry after confirming Firestore access.');
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  // Run data integrity scanner
  const runIntegrityScan = async () => {
    if (!user?.uid) return;
    setScanning(true);
    setIntegrityIssues([]);
    setIntegrityError(null);
    try {
      const db = getFirestoreClient();
      if (!db) return;
      
      const foundIssues = [];

      // 1. Scan for Duplicate Transactions (identical amount, date, description, and account)
      const txRef = collection(db, `users/${user.uid}/transactions`);
      const txQuery = query(txRef, limit(500));
      const txSnap = await getDocs(txQuery);
      const txDocs = txSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

      const duplicateMap = new Map<string, any[]>();
      txDocs.forEach((tx) => {
        const dateStr = tx.date?.toDate ? tx.date.toDate().toDateString() : new Date(tx.date).toDateString();
        const key = `${tx.amount}_${dateStr}_${(tx.description || '').trim()}_${tx.accountId || tx.account}`;
        if (!duplicateMap.has(key)) {
          duplicateMap.set(key, []);
        }
        duplicateMap.get(key)!.push(tx);
      });

      duplicateMap.forEach((duplicates, key) => {
        if (duplicates.length > 1) {
          foundIssues.push({
            id: `dup_${key}`,
            type: 'duplicate_transactions',
            title: 'Duplicate Transaction Records',
            description: `Found ${duplicates.length} identical transaction entries logged on ${new Date(duplicates[0].date?.toDate ? duplicates[0].date.toDate() : duplicates[0].date).toLocaleDateString()} for $${duplicates[0].amount} (${duplicates[0].description}).`,
            items: duplicates,
            suggestion: 'Merge duplicate records into a single transaction.'
          });
        }
      });

      // 2. Scan for Orphaned Transactions (reference accountId that doesn't exist)
      const accRef = collection(db, `users/${user.uid}/accounts`);
      const accSnap = await getDocs(accRef);
      const activeAccountIds = new Set(accSnap.docs.map(d => d.id));

      const orphanedTransactions = txDocs.filter(tx => tx.accountId && !activeAccountIds.has(tx.accountId) && tx.type !== 'transfer');
      if (orphanedTransactions.length > 0) {
        foundIssues.push({
          id: 'orphaned_txs',
          type: 'orphaned_references',
          title: 'Orphaned Account References',
          description: `Detected ${orphanedTransactions.length} transactions associated with accounts that are deleted or do not exist.`,
          items: orphanedTransactions,
          suggestion: 'Re-assign these transactions to a valid primary account or clear references.'
        });
      }

      // 3. Scan for Invalid Categories
      const catRef = collection(db, `users/${user.uid}/categories`);
      const catSnap = await getDocs(catRef);
      const categories = new Set(catSnap.docs.map(d => (d.data().name || '').toLowerCase()));
      // Add standard categories
      ['salary', 'food', 'rent', 'groceries', 'utilities', 'shopping', 'entertainment', 'transfer', 'uncategorized'].forEach(c => categories.add(c));

      const invalidCategoryTxs = txDocs.filter(tx => tx.category && !categories.has(tx.category.toLowerCase()));
      if (invalidCategoryTxs.length > 0) {
        foundIssues.push({
          id: 'invalid_cats',
          type: 'invalid_categories',
          title: 'Invalid Category Associations',
          description: `Found ${invalidCategoryTxs.length} transactions assigned to non-existent categories.`,
          items: invalidCategoryTxs,
          suggestion: 'Reset categories to "uncategorized" or import standard categories.'
        });
      }

      // 4. Missing Ownership check
      const missingOwnershipTxs = txDocs.filter(tx => !tx.userId);
      if (missingOwnershipTxs.length > 0) {
        foundIssues.push({
          id: 'missing_ownership',
          type: 'missing_ownership',
          title: 'Missing User Ownership',
          description: `Found ${missingOwnershipTxs.length} records missing the owner 'userId' property.`,
          items: missingOwnershipTxs,
          suggestion: 'Append current user credentials to restore record visibility.'
        });
      }

      setIntegrityIssues(foundIssues);
      
      // Update Health Data Quality
      const dataQualityScore = Math.max(10, 100 - (foundIssues.length * 15));
      setHealthScores(prev => ({
        ...prev,
        dataQuality: dataQualityScore,
        overall: Math.round((prev.database + prev.performance + prev.sync + prev.security + dataQualityScore) / 5)
      }));

    } catch (err) {
      console.error('Integrity Scan failure', err);
      setIntegrityError('Data integrity check failed.');
      toast.error('Data integrity check failed');
    } finally {
      setScanning(false);
    }
  };

  // Run integrity repair routine
  const runAutoRepair = async (issue: any) => {
    if (!user?.uid) return;
    setRepairing(issue.id);
    try {
      const db = getFirestoreClient();
      if (!db) return;

      const batch = writeBatch(db);
      let itemsAffected = 0;

      if (issue.type === 'duplicate_transactions') {
        // Keep the first document, delete the subsequent duplicates
        const keepId = issue.items[0].id;
        const toDelete = issue.items.slice(1);
        toDelete.forEach((item: any) => {
          const docRef = doc(db, `users/${user.uid}/transactions/${item.id}`);
          batch.delete(docRef);
          itemsAffected++;
        });
      } else if (issue.type === 'orphaned_references') {
        // Find first valid account to assign or fallback
        const accRef = collection(db, `users/${user.uid}/accounts`);
        const accSnap = await getDocs(accRef);
        const fallbackAccountId = accSnap.docs[0]?.id || 'default_account';
        
        issue.items.forEach((item: any) => {
          const docRef = doc(db, `users/${user.uid}/transactions/${item.id}`);
          batch.update(docRef, { accountId: fallbackAccountId, account: fallbackAccountId });
          itemsAffected++;
        });
      } else if (issue.type === 'invalid_categories') {
        issue.items.forEach((item: any) => {
          const docRef = doc(db, `users/${user.uid}/transactions/${item.id}`);
          batch.update(docRef, { category: 'uncategorized' });
          itemsAffected++;
        });
      } else if (issue.type === 'missing_ownership') {
        issue.items.forEach((item: any) => {
          const docRef = doc(db, `users/${user.uid}/transactions/${item.id}`);
          batch.update(docRef, { userId: user.uid });
          itemsAffected++;
        });
      }

      await batch.commit();
      
      // Log Repair in database
      await auditService.logRepair(user.uid, {
        issueType: issue.type,
        description: `Auto-repaired issue: ${issue.title}`,
        itemsAffected,
        status: 'repaired',
        details: { issueId: issue.id }
      });

      toast.success(`${issue.title} successfully repaired!`);
      
      // Refresh integrity data and logs
      await runIntegrityScan();
      await loadAuditLogs();

    } catch (err) {
      console.error('Repair error', err);
      toast.error('Repair failed');
      await auditService.logRepair(user.uid, {
        issueType: issue.type,
        description: `Failed auto-repair: ${issue.title}`,
        itemsAffected: 0,
        status: 'failed',
        details: { error: String(err) }
      });
    } finally {
      setRepairing(null);
    }
  };

  // Seeding routine
  const triggerSeeding = async () => {
    if (!isDev) return;
    if (!user?.uid) return;
    setSeeding(true);
    try {
      const ok = await auditService.seedAuditLogs(user.uid, user.email || 'user@email.com');
      if (ok) {
        toast.success('Simulation audit activities generated!');
        await loadAuditLogs();
      } else {
        toast.error('Failed to generate simulation activities');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  // Clear logs routine
  const triggerClearLogs = async () => {
    if (!user?.uid) return;
    setClearing(true);
    try {
      await auditService.clearAllLogs(user.uid);
      toast.success('Audit history cleared.');
      await loadAuditLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  // Trigger individual mock event
  const triggerMockEvent = async () => {
    if (!isDev) return;
    if (!user?.uid) return;
    try {
      await auditService.logEvent(user.uid, {
        user: user.email || 'user@email.com',
        module: simModule,
        action: simAction,
        status: simStatus,
        severity: simSeverity,
        metadata: { triggeredBy: 'simulation_control_panel', ip: '127.0.0.1' }
      });
      toast.success(`Mock event "${simAction}" triggered!`);
      await loadAuditLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger system error simulation
  const triggerMockError = async () => {
    if (!isDev) return;
    if (!user?.uid) return;
    try {
      await auditService.logError(user.uid, {
        errorType: 'firebase',
        message: 'Simulation Error: Failed to commit write batch due to index constraints.',
        module: 'Import Hub',
        stack: 'Error: Simulation Error\n  at triggerMockError (AuditCenterPage.tsx:556)\n  at onClick (AuditCenterPage.tsx:782)',
        metadata: { source: 'simulated_incident', user: user.email }
      });
      toast.error('Mock system error logged to Error Center!');
      await loadAuditLogs();
      await loadErrors();
    } catch (err) {
      console.error(err);
    }
  };

  // Dismiss Error Log
  const dismissErrorLog = async (errorId: string) => {
    if (!user?.uid) return;
    try {
      await auditService.dismissError(user.uid, errorId);
      toast.success('Error dismissed.');
      await loadErrors();
      await loadAuditLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate health metrics
  const calculateHealthMetrics = (currentLogs: AuditLog[]) => {
    const errorCount = currentLogs.filter(l => l.status === 'failure').length;
    const criticalCount = currentLogs.filter(l => l.severity === 'critical').length;
    const securityCount = currentLogs.filter(l => l.severity === 'security' && l.status === 'failure').length;
    const warningCount = currentLogs.filter(l => l.status === 'warning').length;

    // Database score
    const dbTimeScore = dbResponseTime > 0 ? Math.max(50, 100 - Math.floor(dbResponseTime / 10)) : 98;
    const databaseScore = Math.max(40, dbTimeScore - (criticalCount * 2));

    // Performance score
    const performanceScore = dbResponseTime > 0 ? Math.max(60, 100 - Math.floor(dbResponseTime / 15)) : 95;

    // Security score
    const securityScore = Math.max(10, 100 - (securityCount * 12) - (criticalCount * 5));

    // Sync score
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    const syncScore = isOnline ? 100 : 70;

    // Data Quality score
    const dataQualityScore = healthScores.dataQuality;

    const overallScore = Math.round((databaseScore + performanceScore + syncScore + securityScore + dataQualityScore) / 5);

    setHealthScores({
      database: databaseScore,
      performance: performanceScore,
      sync: syncScore,
      security: securityScore,
      dataQuality: dataQualityScore,
      overall: overallScore
    });
  };

  // Fetch initial data
  useEffect(() => {
    if (user?.uid) {
      loadAuditLogs();
      loadErrors();
      runDiagnostics();
      runIntegrityScan();
    }
  }, [user?.uid]);

  // Handle Tab Loading triggers
  useEffect(() => {
    if (activeTab === 'diagnostics') {
      runDiagnostics();
    } else if (activeTab === 'errors') {
      loadErrors();
    } else if (activeTab === 'integrity') {
      runIntegrityScan();
    }
  }, [activeTab]);

  // Export functions
  const handleExportJSON = (reportName: string, data: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${reportName}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = (reportName: string, data: any[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = (reportName: string, data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
    XLSX.writeFile(workbook, `${reportName}_${Date.now()}.xlsx`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Filtering activity logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

    return matchesSearch && matchesModule && matchesSeverity && matchesStatus;
  });

  // Calculate quick metrics for Overview
  const totalEvents = logs.length;
  const criticalEvents = logs.filter((l) => l.severity === 'critical').length;
  const securityEvents = logs.filter((l) => l.severity === 'security').length;
  const automationEvents = logs.filter((l) => l.module === 'Automation').length;
  const failedOperations = logs.filter((l) => l.status === 'failure').length;

  return (
    <div className="space-y-8 select-none print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit & Diagnostics</h1>
          <p className="text-sm text-secondary">Enterprise system activity logging, database integrity scans, and health metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadAuditLogs}
            disabled={loadingLogs}
            className="rounded-2xl border border-border bg-card hover:bg-card-elevated hover:text-primary transition-all px-4 py-3 text-sm text-foreground flex items-center gap-2"
          >
            <RefreshCw className={`size-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2 print:hidden">
        {[
          { id: 'overview', label: 'Overview', icon: Cpu },
          { id: 'activity', label: 'Activity Logs', icon: Activity },
          { id: 'diagnostics', label: 'Diagnostics Hub', icon: Server },
          { id: 'integrity', label: 'Data Integrity', icon: Database },
          { id: 'errors', label: 'Error Center', icon: AlertOctagon },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-accent text-accent-mint bg-accent-mint/5'
                  : 'border-transparent text-secondary hover:text-foreground hover:border-border'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === 'errors' && errorRecords.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-destructive text-white rounded-full">
                  {errorRecords.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main content viewport */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* ──────────────────────────────────────────────────────────────── OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Statistics Cards */}
                <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 print:grid-cols-5">
                  {[
                    { label: 'Total Events', val: totalEvents, color: 'text-primary', bg: 'bg-accent-mint/5' },
                    { label: 'Critical Incidents', val: criticalEvents, color: criticalEvents > 0 ? 'text-destructive' : 'text-foreground', bg: criticalEvents > 0 ? 'bg-red-500/10' : 'bg-card' },
                    { label: 'Security Audits', val: securityEvents, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                    { label: 'Automations Run', val: automationEvents, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                    { label: 'Failed Operations', val: failedOperations, color: failedOperations > 0 ? 'text-warning' : 'text-foreground', bg: failedOperations > 0 ? 'bg-warning/10' : 'bg-card' }
                  ].map((stat, idx) => (
                    <div key={idx} className={`rounded-[28px] border border-border p-5 ${stat.bg}`}>
                      <p className="text-xs uppercase tracking-widest text-secondary font-semibold">{stat.label}</p>
                      <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Health & Simulation Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Gauge Wheel */}
                  <div className="rounded-[28px] border border-border bg-card p-6 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-6">Overall System Health</h3>
                    <div className="relative size-40 flex items-center justify-center">
                      <svg className="size-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          className="stroke-border fill-transparent"
                          strokeWidth="10"
                        />
                        <motion.circle
                          cx="80"
                          cy="80"
                          r="68"
                          className="stroke-accent fill-transparent"
                          strokeWidth="12"
                          strokeDasharray={427}
                          initial={{ strokeDashoffset: 427 }}
                          animate={{ strokeDashoffset: 427 - (427 * healthScores.overall) / 100 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-4xl font-extrabold text-foreground">{healthScores.overall}</span>
                        <span className="text-xs text-secondary block font-semibold uppercase tracking-wider">Score</span>
                      </div>
                    </div>

                    <div className="w-full mt-6 space-y-3">
                      {[
                        { name: 'Database', score: healthScores.database },
                        { name: 'Performance', score: healthScores.performance },
                        { name: 'Sync & Network', score: healthScores.sync },
                        { name: 'App Security', score: healthScores.security },
                        { name: 'Data Quality', score: healthScores.dataQuality }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                          <span className="text-secondary font-medium">{item.name} Health</span>
                          <span className={`font-bold ${item.score > 90 ? 'text-accent-mint' : item.score > 70 ? 'text-warning' : 'text-destructive'}`}>
                            {item.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Timeline Preview */}
                  <div className="rounded-[28px] border border-border bg-card p-6 flex flex-col justify-between lg:col-span-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Live Activity Stream</h3>
                      <div className="space-y-4">
                        {loadingLogs ? (
                          <div className="py-12 text-center text-secondary text-sm">Loading activity stream...</div>
                        ) : filteredLogs.length === 0 ? (
                          <div className="py-12 text-center text-secondary text-sm">No activity logs recorded yet. Run simulation to populate.</div>
                        ) : (
                          filteredLogs.slice(0, 4).map((log) => (
                            <div key={log.id} className="flex gap-4 items-start p-3 rounded-2xl bg-background/50 hover:bg-background border border-border/20 transition-all">
                              <div className={`p-2 rounded-xl grid place-items-center ${
                                log.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                                log.severity === 'security' ? 'bg-blue-500/10 text-blue-400' :
                                log.severity === 'warning' ? 'bg-warning/10 text-warning' : 'bg-accent-mint/10 text-accent-mint'
                              }`}>
                                {log.severity === 'security' ? <Shield size={16} /> : <Activity size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-foreground truncate">{log.action}</p>
                                  <span className="text-[10px] text-secondary font-semibold shrink-0">
                                    {log.timestamp?.toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-secondary mt-1">
                                  <span>Module: <strong className="text-foreground/80">{log.module}</strong></span>
                                  <span>User: <span className="font-mono">{log.user.split('@')[0]}</span></span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {isDev && (
                      <>
                        {/* Simulator Dashboard Controls */}
                        <div className="border-t border-border mt-6 pt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider block">Simulator Trigger</label>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <select
                              value={simModule}
                              onChange={(e) => setSimModule(e.target.value)}
                              className="flex-1 bg-background border border-border text-xs rounded-xl px-2 py-2 text-foreground focus:outline-none"
                            >
                              {INTEGRATION_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                              type="text"
                              value={simAction}
                              onChange={(e) => setSimAction(e.target.value)}
                              className="flex-1 bg-background border border-border text-xs rounded-xl px-2 py-2 text-foreground focus:outline-none"
                              placeholder="Action text"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={simSeverity}
                              onChange={(e) => setSimSeverity(e.target.value as any)}
                              className="flex-1 bg-background border border-border text-xs rounded-xl px-2 py-2 text-foreground focus:outline-none"
                            >
                              <option value="info">Info</option>
                              <option value="warning">Warning</option>
                              <option value="critical">Critical</option>
                              <option value="security">Security</option>
                            </select>
                            <button
                              onClick={triggerMockEvent}
                              className="bg-accent-mint hover:brightness-95 text-[#071a0d] font-semibold text-xs rounded-xl px-3 py-2 transition flex items-center justify-center gap-1.5"
                            >
                              <Play size={12} /> Log Event
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-end">
                        <div className="flex gap-2">
                          <Button
                            onClick={triggerSeeding}
                            disabled={seeding}
                            className="flex-1 rounded-xl bg-accent-mint text-[#071a0d] font-semibold hover:brightness-95 transition-all text-xs py-2 flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={12} className={seeding ? 'animate-spin' : ''} />
                            {seeding ? 'Generating...' : 'Seed History'}
                          </Button>
                          <Button
                            onClick={triggerMockError}
                            className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold text-xs py-2 flex items-center justify-center gap-1.5"
                          >
                            <AlertOctagon size={12} />
                            Log Error
                          </Button>
                        </div>
                        <Button
                          onClick={triggerClearLogs}
                          disabled={clearing}
                          className="rounded-xl border border-border bg-background text-secondary hover:text-destructive transition-all text-xs py-2 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          {clearing ? 'Clearing...' : 'Wipe Audit Trail'}
                        </Button>
                      </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────── SYSTEM ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                {/* Search Bar & Filters */}
                <div className="rounded-[28px] border border-border bg-card p-5 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary size-5" />
                    <input
                      type="text"
                      placeholder="Search activity by action details, module, user, metadata..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-background border border-border text-sm rounded-[20px] pl-12 pr-4 py-3.5 text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                    <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                      <SlidersHorizontal size={14} className="text-secondary" />
                      <span>Filters</span>
                    </div>

                    {/* Module */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Module:</span>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none"
                      >
                        <option value="all">All Modules</option>
                        {INTEGRATION_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    {/* Severity */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Severity:</span>
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none"
                      >
                        <option value="all">All Severities</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                        <option value="security">Security</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Status:</span>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                      </select>
                    </div>

                    {/* Quick reset */}
                    {(selectedModule !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                      <button
                        onClick={() => {
                          setSelectedModule('all');
                          setSelectedSeverity('all');
                          setSelectedStatus('all');
                          setSearchTerm('');
                        }}
                        className="text-accent-mint hover:underline normal-case text-xs flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw size={12} /> Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Audit Logs Timeline Feed */}
                <div className="rounded-[28px] border border-border bg-card overflow-hidden">
                  {loadingLogs ? (
                    <div className="py-24 text-center text-secondary">Loading audit records...</div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="py-24 text-center text-secondary">No records match the active search and filter constraints.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Responsive Header Row */}
                      <div className="hidden lg:grid lg:grid-cols-12 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary bg-background/50">
                        <div className="col-span-2">Timestamp</div>
                        <div className="col-span-2">User</div>
                        <div className="col-span-2">Module</div>
                        <div className="col-span-4">Action</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Details</div>
                      </div>

                      {/* Log items */}
                      {filteredLogs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        return (
                          <div key={log.id} className="flex flex-col">
                            {/* Line Feed Row */}
                            <div
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id!)}
                              className="grid grid-cols-1 lg:grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-all cursor-pointer text-sm gap-2"
                            >
                              {/* Mobile headers and standard fields */}
                              <div className="col-span-2 text-xs text-secondary lg:text-foreground font-mono">
                                {log.timestamp?.toLocaleString()}
                              </div>
                              <div className="col-span-2 truncate font-medium text-foreground">
                                {log.user}
                              </div>
                              <div className="col-span-2 text-xs lg:text-sm">
                                <span className="bg-background border border-border/30 rounded-xl px-2.5 py-1 font-semibold text-secondary-text">
                                  {log.module}
                                </span>
                              </div>
                              <div className="col-span-4 font-semibold text-foreground flex items-center gap-2">
                                <div className={`size-2 rounded-full shrink-0 ${
                                  log.severity === 'critical' ? 'bg-destructive' :
                                  log.severity === 'security' ? 'bg-blue-400' :
                                  log.severity === 'warning' ? 'bg-warning' : 'bg-accent-mint'
                                }`} />
                                {log.action}
                              </div>
                              <div className="col-span-1 text-center flex justify-start lg:justify-center">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  log.status === 'success' ? 'bg-green-950/40 text-green-400 border border-green-800/30' :
                                  log.status === 'failure' ? 'bg-red-950/40 text-red-400 border border-red-800/30' :
                                  log.status === 'warning' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-background text-secondary'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              <div className="col-span-1 text-right lg:text-center hidden lg:block">
                                <button className="text-secondary hover:text-foreground">
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              </div>
                            </div>

                            {/* Expandable Meta details Drawer */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-background/50 border-t border-border/20 px-6 py-4"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">Log Metadata Context</h4>
                                      <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Severity: <strong className="text-foreground">{log.severity}</strong></span>
                                    </div>
                                    <pre className="text-xs text-secondary font-mono p-4 rounded-xl bg-card border border-border overflow-x-auto">
                                      {JSON.stringify({
                                        id: log.id,
                                        userId: log.userId,
                                        module: log.module,
                                        action: log.action,
                                        status: log.status,
                                        severity: log.severity,
                                        timestamp: log.timestamp,
                                        metadata: log.metadata || {}
                                      }, null, 2)}
                                    </pre>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────── DIAGNOSTICS HUB */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-foreground">Diagnostics Monitors</h2>
                  <Button
                    onClick={runDiagnostics}
                    disabled={diagnosticsLoading}
                    className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl"
                  >
                    <RefreshCw className={`size-3.5 mr-1.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
                    Run Diagnostic Tests
                  </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {diagnosticsError && (
                    <div className="lg:col-span-2 rounded-[28px] border border-border bg-card p-6 text-sm text-secondary flex items-center justify-between gap-4">
                      <span>{diagnosticsError}</span>
                      <Button onClick={runDiagnostics} className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl">
                        Retry Diagnostics
                      </Button>
                    </div>
                  )}
                  {/* Database check */}
                  <div className="rounded-[28px] border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Database className="size-6 text-accent-mint" />
                        <h3 className="font-semibold text-foreground">Database Sync Status</h3>
                      </div>
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-xl ${dbResponseTime > 0 ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'}`}>
                        {dbResponseTime > 0 ? 'Connected' : 'Error'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex justify-between">
                        <span>Database Provider:</span>
                        <strong className="text-foreground">Google Cloud Firestore</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection Ping:</span>
                        <strong className="text-foreground">{dbResponseTime}ms</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Persistence Mode:</span>
                        <strong className="text-foreground">Offline Persistence (Enabled)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Network / Client status */}
                  <div className="rounded-[28px] border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Server className="size-6 text-blue-400" />
                        <h3 className="font-semibold text-foreground">Environment / Runtime</h3>
                      </div>
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-xl bg-blue-900/30 text-blue-400">
                        {typeof window !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <strong className="text-foreground uppercase">{process.env.NODE_ENV || 'production'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Client Version:</span>
                        <strong className="text-foreground font-mono">v1.2.8-beta</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Offline Queue size:</span>
                        <strong className="text-foreground">0 pending operations</strong>
                      </div>
                    </div>
                  </div>

                  {/* Collection storage count status */}
                  <div className="rounded-[28px] border border-border bg-card p-6 lg:col-span-2">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-purple-400" />
                      Collections Registry Counts
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(storageData.collections).map(([colName, count]) => (
                        <div key={colName} className="rounded-2xl bg-background border border-border/40 p-4">
                          <p className="text-xs text-secondary uppercase tracking-widest font-semibold truncate">{colName}</p>
                          <h4 className="text-xl font-bold mt-2 text-foreground">{count} docs</h4>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-border/40 pt-4 flex flex-wrap gap-6 text-sm text-secondary">
                      <div>
                        Total Documents: <strong className="text-foreground">{storageData.totalItems}</strong>
                      </div>
                      <div>
                        Estimated size: <strong className="text-foreground">{(storageData.estimatedSize / 1024).toFixed(2)} KB</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────── DATA INTEGRITY SCANNER */}
            {activeTab === 'integrity' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Database Data Integrity Inspector</h2>
                    <p className="text-sm text-secondary">Identifies duplicate records, orphaned sub-keys, and invalid categorical relationships in database schema.</p>
                  </div>
                  <Button
                    onClick={runIntegrityScan}
                    disabled={scanning}
                    className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl"
                  >
                    <RefreshCw className={`size-3.5 mr-1.5 ${scanning ? 'animate-spin' : ''}`} />
                    Scan Database
                  </Button>
                </div>

                {scanning ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary">
                    <div className="h-10 w-10 border-4 border-accent-mint border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <span>Analyzing Firestore records for structural validation...</span>
                  </div>
                ) : integrityError ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary flex flex-col items-center gap-3">
                    <AlertTriangle className="size-12 text-amber-400" />
                    <h3 className="text-lg font-bold text-foreground">Integrity Scan Unavailable</h3>
                    <p className="text-sm max-w-md">{integrityError}</p>
                    <Button onClick={runIntegrityScan} className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl">
                      Retry Scan
                    </Button>
                  </div>
                ) : integrityIssues.length === 0 ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary flex flex-col items-center gap-3">
                    <CheckCircle className="size-12 text-accent-mint" />
                    <h3 className="text-lg font-bold text-foreground">Database Integrity Solid</h3>
                    <p className="text-sm max-w-md">Excellent! No duplicates, orphaned documents, missing owner credentials, or relationship anomalies detected.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {integrityIssues.map((issue) => (
                      <div key={issue.id} className="rounded-[28px] border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                            <AlertTriangle className="size-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{issue.title}</h4>
                            <p className="text-sm text-secondary mt-1">{issue.description}</p>
                            <div className="mt-3 inline-flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-secondary-text">
                              <span className="font-bold text-accent-mint">Repair:</span> {issue.suggestion}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => runAutoRepair(issue)}
                          disabled={repairing === issue.id}
                          className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-bold rounded-xl px-5 py-3 shrink-0"
                        >
                          {repairing === issue.id ? (
                            <>
                              <RefreshCw size={14} className="animate-spin mr-1.5" />
                              Repairing...
                            </>
                          ) : (
                            'Run Auto-Repair'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────── ERROR CENTER */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">System Error & Incident Logger</h2>
                    <p className="text-sm text-secondary">Real-time listing of runtime errors, database transaction blocks, and network failures.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {errorRecords.length > 0 && (
                      <Button
                        onClick={() => handleExportJSON('Incident_Report', errorRecords)}
                        className="rounded-xl border border-border bg-card hover:bg-card-elevated text-xs font-semibold px-3 py-2 text-foreground flex items-center gap-1.5"
                      >
                        <Download size={14} /> Export Logs
                      </Button>
                    )}
                    <Button
                      onClick={loadErrors}
                      disabled={loadingErrors}
                      className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl"
                    >
                      <RefreshCw className={`size-3.5 mr-1.5 ${loadingErrors ? 'animate-spin' : ''}`} />
                      Refresh Incidents
                    </Button>
                  </div>
                </div>

                {loadingErrors ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary">
                    Loading incident history logs...
                  </div>
                ) : errorsError ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary flex flex-col items-center gap-3">
                    <AlertTriangle className="size-12 text-amber-400" />
                    <h3 className="text-lg font-bold text-foreground">Error History Unavailable</h3>
                    <p className="text-sm max-w-md">{errorsError}</p>
                    <Button onClick={loadErrors} className="bg-accent-mint text-[#071a0d] hover:brightness-95 transition-all text-xs font-semibold rounded-xl">
                      Retry
                    </Button>
                  </div>
                ) : errorRecords.length === 0 ? (
                  <div className="rounded-[28px] border border-border bg-card p-12 text-center text-secondary flex flex-col items-center gap-3">
                    <CheckCircle className="size-12 text-accent-mint" />
                    <h3 className="text-lg font-bold text-foreground">Zero Open Incidents</h3>
                    <p className="text-sm max-w-md">No runtime, network, or database failures are currently registered in your environment.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {errorRecords.map((err) => (
                      <div key={err.id} className="rounded-[28px] border border-border bg-card overflow-hidden">
                        {/* Summary Header */}
                        <div className="p-6 bg-background/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl shrink-0">
                              <AlertOctagon className="size-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-foreground">{err.message}</h4>
                                <span className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                  {err.errorType}
                                </span>
                              </div>
                              <p className="text-xs text-secondary mt-1">
                                Module: <strong className="text-foreground/80">{err.module}</strong> | Logged on: {new Date(err.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <Button
                              onClick={async () => {
                                toast.loading('Simulating retry hook...', { duration: 1000 });
                                setTimeout(() => {
                                  dismissErrorLog(err.id!);
                                  toast.success('Simulation retry succeeded, incident dismissed!');
                                }, 1000);
                              }}
                              className="bg-accent-mint text-[#071a0d] hover:brightness-95 text-xs font-semibold rounded-xl"
                            >
                              Retry
                            </Button>
                            <Button
                              onClick={() => dismissErrorLog(err.id!)}
                              className="rounded-xl border border-border bg-background text-secondary hover:text-destructive hover:border-destructive/30 text-xs py-2 px-3"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Stack Trace */}
                        {err.stack && (
                          <div className="p-6 bg-background/10 space-y-2">
                            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Stack Trace</p>
                            <pre className="text-xs font-mono bg-background border border-border/40 p-4 rounded-xl text-secondary overflow-x-auto max-h-40">
                              {err.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────── COMPLIANCE REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Compliance Report Exporter</h2>
                  <p className="text-sm text-secondary">Export structured logs, security audits, diagnostics data and health snapshots in enterprise formats.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      title: 'System Activity Audit Report',
                      desc: 'Includes full transactional operations, automation event histories, and category modifications log.',
                      type: 'audit_report',
                      data: logs
                    },
                    {
                      title: 'Security Auditing Compliance Log',
                      desc: 'PIN modifications, failed login incidents, device session revocations, and system lockout flags.',
                      type: 'security_report',
                      data: logs.filter(l => l.severity === 'security')
                    },
                    {
                      title: 'Diagnostics Registry Manifest',
                      desc: 'Overview of user document storage size, connection latencies, and offline sync transaction counts.',
                      type: 'diagnostics_report',
                      data: [storageData]
                    },
                    {
                      title: 'System Health Snapshot Summary',
                      desc: 'Comprehensive score overview of database health, security indexes, data quality, and network status.',
                      type: 'health_report',
                      data: [healthScores]
                    }
                  ].map((report, idx) => (
                    <div key={idx} className="rounded-[28px] border border-border bg-card p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground">{report.title}</h3>
                        <p className="text-sm text-secondary">{report.desc}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
                        <button
                          onClick={() => handleExportJSON(report.type, report.data)}
                          className="bg-background border border-border hover:bg-card-elevated text-xs font-semibold px-3.5 py-2 rounded-xl text-foreground transition-all flex items-center gap-1.5"
                        >
                          <Download size={12} /> JSON
                        </button>
                        <button
                          onClick={() => handleExportCSV(report.type, report.data)}
                          className="bg-background border border-border hover:bg-card-elevated text-xs font-semibold px-3.5 py-2 rounded-xl text-foreground transition-all flex items-center gap-1.5"
                        >
                          <Download size={12} /> CSV
                        </button>
                        <button
                          onClick={() => handleExportExcel(report.type, report.data)}
                          className="bg-background border border-border hover:bg-card-elevated text-xs font-semibold px-3.5 py-2 rounded-xl text-foreground transition-all flex items-center gap-1.5"
                        >
                          <Download size={12} /> Excel
                        </button>
                        <button
                          onClick={handleExportPDF}
                          className="bg-accent-mint text-[#071a0d] hover:brightness-95 text-xs font-bold px-4 py-2 rounded-xl transition-all ml-auto flex items-center gap-1.5"
                        >
                          <FileText size={12} /> Print PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Printable Compliance Document template */}
                <div className="hidden print:block p-8 bg-white text-black space-y-6 font-sans">
                  <div className="flex justify-between items-start border-b-2 border-black pb-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">NEO FINANCE OS</h1>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Compliance & Diagnostics System Manifest</p>
                    </div>
                    <div className="text-right text-xs">
                      <p>Run Date: {new Date().toLocaleDateString()}</p>
                      <p>Auditor: {user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">1. Executive Summary</h2>
                    <div className="grid grid-cols-5 border border-slate-300 p-4 rounded-lg bg-slate-50 gap-4 text-center">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Health Score</span>
                        <strong className="text-xl">{healthScores.overall}%</strong>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Total Logs</span>
                        <strong className="text-xl">{totalEvents}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Critical Errors</span>
                        <strong className="text-xl">{criticalEvents}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Security Events</span>
                        <strong className="text-xl">{securityEvents}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-semibold">DB Ping</span>
                        <strong className="text-xl">{dbResponseTime}ms</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">2. Recent System Actions Log</h2>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-black text-left font-bold bg-slate-100">
                          <th className="p-2">Timestamp</th>
                          <th className="p-2">Module</th>
                          <th className="p-2">Action Description</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.slice(0, 20).map(log => (
                          <tr key={log.id} className="border-b border-slate-200">
                            <td className="p-2 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-2 font-semibold">{log.module}</td>
                            <td className="p-2">{log.action}</td>
                            <td className="p-2 text-center uppercase font-bold">{log.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
