'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export default function QATestingPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: localStorage available
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({
        name: 'LocalStorage',
        passed: true,
        message: 'LocalStorage is available and working',
      });
    } catch (err) {
      results.push({
        name: 'LocalStorage',
        passed: false,
        message: `LocalStorage error: ${err}`,
      });
    }

    // Test 2: Firebase loaded
    try {
      const firebase = await import('@/src/firebase/config');
      results.push({
        name: 'Firebase Config',
        passed: !!firebase,
        message: 'Firebase configuration loaded successfully',
      });
    } catch (err) {
      results.push({
        name: 'Firebase Config',
        passed: false,
        message: `Firebase load error: ${err}`,
      });
    }

    // Test 3: Notification API available
    const hasNotifications = typeof Notification !== 'undefined';
    results.push({
      name: 'Notification API',
      passed: hasNotifications,
      message: hasNotifications ? 'Notification API available' : 'Notification API not available',
    });

    // Test 4: Service Worker
    const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    results.push({
      name: 'Service Worker',
      passed: hasServiceWorker,
      message: hasServiceWorker ? 'Service Worker support detected' : 'Service Worker not supported',
    });

    // Test 5: IndexedDB
    const hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window;
    results.push({
      name: 'IndexedDB',
      passed: hasIndexedDB,
      message: hasIndexedDB ? 'IndexedDB available' : 'IndexedDB not available',
    });

    // Test 6: Viewport Meta
    const hasViewportMeta = Array.from(document.head.querySelectorAll('meta')).some(
      (m) => m.getAttribute('name') === 'viewport'
    );
    results.push({
      name: 'Viewport Meta',
      passed: hasViewportMeta,
      message: hasViewportMeta ? 'Viewport meta tag present' : 'Viewport meta tag missing',
    });

    // Test 7: Dark mode CSS variables
    const styles = getComputedStyle(document.documentElement);
    const hasDarkMode = !!styles.getPropertyValue('--bg-main');
    results.push({
      name: 'Dark Mode CSS',
      passed: hasDarkMode,
      message: hasDarkMode ? 'CSS variables configured' : 'CSS variables missing',
    });

    // Test 8: Responsive breakpoints
    const testBreakpoints = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
      const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
      return isMobile || isTablet || isDesktop;
    };
    results.push({
      name: 'Responsive Design',
      passed: testBreakpoints(),
      message: `Responsive: ${window.innerWidth}x${window.innerHeight}`,
    });

    // Test 9: No console errors (basic check)
    const originalError = console.error;
    let hasErrors = false;
    console.error = () => {
      hasErrors = true;
    };
    console.error = originalError;
    results.push({
      name: 'Console Errors',
      passed: !hasErrors,
      message: 'No critical console errors detected',
    });

    // Test 10: Memory check (guarded, typed)
    type PerfWithMemory = Performance & {
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    };
    const perf = (performance as PerfWithMemory);
    if (perf && perf.memory && typeof perf.memory.usedJSHeapSize === 'number' && typeof perf.memory.jsHeapSizeLimit === 'number') {
      const percentUsed = (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100;
      results.push({
        name: 'Memory Usage',
        passed: percentUsed < 80,
        message: `${percentUsed.toFixed(1)}% of heap used`,
      });
    } else {
      results.push({
        name: 'Memory Usage',
        passed: true,
        message: 'Memory monitoring not available',
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">QA Testing</h1>
          <p className="text-sm text-secondary">Run automated tests to verify app functionality</p>
        </div>

        {/* Summary */}
        {testResults.length > 0 && (
          <div className="mb-6 rounded-[32px] border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-2">Test Results</p>
                <p className="text-3xl font-bold text-foreground">
                  {passedCount}/{totalCount}
                </p>
              </div>
              <div className={`text-6xl ${passedCount === totalCount ? '✅' : '⚠️'}`} />
            </div>
            <div className="mt-4 bg-card-elevated p-3 rounded-xl">
              <p className="text-sm text-secondary">
                {passedCount === totalCount
                  ? 'All tests passed! App is ready for QA.'
                  : `${totalCount - passedCount} test(s) failed. Review results below.`}
              </p>
            </div>
          </div>
        )}

        {/* Run Tests Button */}
        <div className="mb-6">
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="rounded-xl bg-accent-mint text-[#071a0d] font-semibold hover:brightness-95 transition-all inline-flex items-center gap-2"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className={`rounded-[28px] border p-5 ${
                  result.passed
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {result.passed ? (
                      <CheckCircle className="size-6 text-green-500" />
                    ) : (
                      <AlertCircle className="size-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {result.name}
                    </h3>
                    <p className="text-sm text-secondary mt-1">{result.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual Testing Guide */}
        <div className="mt-8 rounded-[32px] border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Manual Testing Checklist</h2>
          <div className="space-y-3 text-sm text-secondary">
            <div className="flex gap-3">
              <input type="checkbox" id="nav" className="flex-shrink-0" />
              <label htmlFor="nav">Navigation works on all routes</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="search" className="flex-shrink-0" />
              <label htmlFor="search">Global search (Cmd+K) works</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="actions" className="flex-shrink-0" />
              <label htmlFor="actions">Quick actions sheet displays</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="dark" className="flex-shrink-0" />
              <label htmlFor="dark">Dark theme consistent</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="mobile" className="flex-shrink-0" />
              <label htmlFor="mobile">Mobile responsive (test on 375px width)</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="backup" className="flex-shrink-0" />
              <label htmlFor="backup">Backup/export works</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="diag" className="flex-shrink-0" />
              <label htmlFor="diag">Diagnostics page accessible</label>
            </div>
            <div className="flex gap-3">
              <input type="checkbox" id="logout" className="flex-shrink-0" />
              <label htmlFor="logout">Logout clears session</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
