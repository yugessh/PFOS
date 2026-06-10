import DevTestsService from '@/src/services/dev-tests.service';
import { runFirebaseHealthChecks } from './firebase-health.service';

const ReadinessService = {
  async computeReadiness(userId: string) {
    const results: any = {};
    // Feature completeness: based on module CRUD checks
    const modules = ['accounts','budgets','goals','investments','notifications'];
    const moduleResults = await Promise.all(modules.map(m => DevTestsService.runModuleCrudCheck(userId, m)));
    const featureScore = Math.round((moduleResults.filter(r => r.success).length / modules.length) * 100);
    results.feature = { score: featureScore, details: moduleResults };

    // Notification completeness: run notification workflow
    const notif = await DevTestsService.runNotificationWorkflow(userId);
    results.notification = { score: notif.success ? 100 : 0, details: notif };

    // Realtime / Performance: measure realtime latency
    const latency = await DevTestsService.measureRealtimeLatency(userId, 3).catch(() => ({ success: false }));
    const perfScore = latency.success ? Math.max(0, 100 - (((latency as any).stats?.avg) || 0)) : 50;
    results.performance = { score: perfScore, details: latency };

    // Firebase health
    const fb = await runFirebaseHealthChecks(userId);
    results.firebase = { score: fb.healthScore || 0, details: fb };

    // Backend & Integration: approximate via full system workflow
    const full = await DevTestsService.runFullSystemWorkflow(userId).catch(() => ({ success: false }));
    const integrationScore = full.success ? 100 : 60;
    results.integration = { score: integrationScore, details: full };

    // Mobile & Security are heuristic placeholders
    results.mobile = { score: 80, details: { note: 'heuristic checks not implemented' } };
    results.security = { score: fb.securityScore || 70, details: fb };

    // Aggregate
    const keys = ['feature','notification','firebase','integration','performance','mobile','security'];
    const total = keys.reduce((s, k) => s + (results[k]?.score || 0), 0);
    const overall = Math.round(total / keys.length);
    results.overall = overall;

    return { success: true, results };
  }
};

export default ReadinessService;
