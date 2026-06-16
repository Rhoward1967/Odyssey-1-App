/**
 * FCRA Compliance Dashboard
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 *
 * Composes the existing FCRA system — no parallel logic:
 *   • fcraMonitoringService → consolidated "what needs attention now" banner
 *   • FCRAComplianceTracker  → per-entity certified-mail detail + actions
 *
 * Scope: objective timeline tracking only. No legal conclusions.
 */

import { useEffect, useState } from 'react';
import { fcraMonitoring } from '@/services/fcraMonitoringService';
import FCRAComplianceTracker from '@/components/FCRAComplianceTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { differenceInDays } from 'date-fns';

type MonitoringReport = Awaited<ReturnType<typeof fcraMonitoring.generateMonitoringReport>>;

export default function FCRADashboard() {
  const [report, setReport] = useState<MonitoringReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    setLoading(true);
    try {
      const r = await fcraMonitoring.generateMonitoringReport();
      setReport(r);
    } catch (err) {
      console.error('FCRA monitoring report failed:', err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const overdue = report?.overdue ?? [];
  const approaching = report?.approaching_deadline ?? [];
  const hasUrgent = overdue.length > 0 || approaching.length > 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
            FCRA Compliance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Certified-mail response tracking — objective deadline monitoring (15 USC §1692g).
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={loadReport} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Consolidated monitoring banner — the at-a-glance "needs attention now" view */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Monitoring Summary
          </CardTitle>
          <CardDescription>
            {report
              ? `${report.total_mailings} tracked · ${report.responses_received} responded · ${report.pending_responses} pending · ${report.overdue_count} non-responsive`
              : 'Live status of approaching and overdue response deadlines.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : !hasUrgent ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                No urgent actions. All deadlines are 8+ days out or responses received.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {overdue.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Non-Responsive (past deadline)
                  </div>
                  <div className="space-y-1">
                    {overdue.map(r => {
                      const daysOverdue = Math.abs(differenceInDays(new Date(r.fcra_deadline), new Date()));
                      return (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span>
                            {r.entity_name}
                            {r.entity_type ? <span className="text-muted-foreground"> ({r.entity_type})</span> : null}
                          </span>
                          <Badge className="bg-red-500">{daysOverdue} days overdue</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {approaching.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-2">
                    <Clock className="h-4 w-4" />
                    Deadlines Approaching (≤7 days)
                  </div>
                  <div className="space-y-1">
                    {approaching.map(r => {
                      const daysLeft = differenceInDays(new Date(r.fcra_deadline), new Date());
                      return (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span>
                            {r.entity_name}
                            {r.entity_type ? <span className="text-muted-foreground"> ({r.entity_type})</span> : null}
                          </span>
                          <Badge className="bg-amber-500">{daysLeft} days left</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full per-entity tracker (existing component) */}
      <FCRAComplianceTracker />
    </div>
  );
}
