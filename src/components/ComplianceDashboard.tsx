/**
 * Self-Updating Compliance Dashboard
 * Real-time view of AI compliance status
 * 
 * Shows:
 * 1. Overall compliance score per AI system
 * 2. Pending regulatory changes (need review)
 * 3. Upcoming enforcement deadlines
 * 4. Recent compliance checks
 * 5. Auto-update status
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import complianceMonitorService, { ComplianceStatus, RegulatoryChange } from '@/services/complianceMonitorService';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Globe,
    Shield,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const ComplianceDashboard: React.FC = () => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [pendingChanges, setPendingChanges] = useState<RegulatoryChange[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadComplianceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      const [status, changes] = await Promise.all([
        complianceMonitorService.getComplianceStatus(),
        complianceMonitorService.getPendingRegulatoryChanges()
      ]);
      
      setComplianceStatus(status);
      setPendingChanges(changes);
      setLastCheck(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      setLoading(false);
    }
  };

  const runManualCheck = async () => {
    setIsMonitoring(true);
    try {
      await complianceMonitorService.runScheduledMonitoring();
      await loadComplianceData();
    } finally {
      setIsMonitoring(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading compliance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Self-Updating Compliance System
          </h1>
          <p className="text-gray-600 mt-1">
            🎵 "I'll Be Watching" - Continuous regulatory monitoring & auto-updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-gray-500">
            <div>Last Check:</div>
            <div className="font-medium">
              {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
            </div>
          </div>
          <Button 
            onClick={runManualCheck} 
            disabled={isMonitoring}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Monitoring...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Run Check Now
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="systems">
            <CheckCircle className="h-4 w-4 mr-2" />
            AI Systems
          </TabsTrigger>
          <TabsTrigger value="changes">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Pending Changes ({pendingChanges.length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            <FileText className="h-4 w-4 mr-2" />
            Active Rules
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          {/* Global Compliance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Global Compliance Score
              </CardTitle>
              <CardDescription>
                Aggregated compliance across all AI systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceStatus.length > 0 ? (
                <>
                  <div className="flex items-end gap-4 mb-4">
                    <div className={`text-6xl font-bold ${getComplianceColor(
                      Math.round(complianceStatus.reduce((acc, s) => acc + s.compliance_percentage, 0) / complianceStatus.length)
                    )}`}>
                      {Math.round(complianceStatus.reduce((acc, s) => acc + s.compliance_percentage, 0) / complianceStatus.length)}%
                    </div>
                    <div className="text-gray-600 pb-2">
                      {complianceStatus.reduce((acc, s) => acc + s.rules_compliant, 0)}/
                      {complianceStatus.reduce((acc, s) => acc + s.total_rules_applicable, 0)} rules compliant
                    </div>
                  </div>
                  
                  {/* Jurisdictional Compliance */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    {[
                      { label: 'EU', key: 'eu_compliant', icon: '🇪🇺' },
                      { label: 'US', key: 'us_compliant', icon: '🇺🇸' },
                      { label: 'China', key: 'cn_compliant', icon: '🇨🇳' },
                      { label: 'Global', key: 'global_compliant', icon: '🌍' }
                    ].map(jurisdiction => {
                      const compliant = complianceStatus.every(s => s[jurisdiction.key as keyof ComplianceStatus]);
                      return (
                        <div key={jurisdiction.key} className="text-center">
                          <div className="text-3xl mb-2">{jurisdiction.icon}</div>
                          <div className="font-medium">{jurisdiction.label}</div>
                          <Badge variant={compliant ? 'default' : 'destructive'} className="mt-1">
                            {compliant ? '✓ Compliant' : '✗ Non-Compliant'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No compliance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto-Update Status */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Self-Updating Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Regulatory Monitoring</span>
                  <Badge className="bg-green-500">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-Deploy</span>
                  <Badge variant="secondary">Pending Human Review</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Scheduled Check</span>
                  <span className="text-sm text-gray-600">
                    {complianceStatus[0]?.next_scheduled_check 
                      ? new Date(complianceStatus[0].next_scheduled_check).toLocaleString()
                      : 'Not scheduled'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monitoring Jurisdictions</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">EU</Badge>
                    <Badge variant="outline">US</Badge>
                    <Badge variant="outline">CN</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI SYSTEMS TAB */}
        <TabsContent value="systems" className="space-y-4">
          {complianceStatus.map(status => (
            <Card key={status.ai_system} className={`border-2 ${getRiskColor(status.risk_level)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">
                      {status.ai_system.replace(/_/g, ' ')}
                    </CardTitle>
                    <CardDescription>
                      Risk Level: {status.risk_level.toUpperCase()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getComplianceColor(status.compliance_percentage)}`}>
                      {Math.round(status.compliance_percentage)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {status.rules_compliant}/{status.total_rules_applicable} rules
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compliance Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Compliance Status</span>
                    <span>{status.rules_compliant} compliant, {status.rules_non_compliant} non-compliant, {status.rules_pending_review} pending</span>
                  </div>
                  <Progress 
                    value={status.compliance_percentage} 
                    className="h-3"
                  />
                </div>

                {/* Open Violations */}
                {status.open_violations > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-700 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      {status.open_violations} Open Violation{status.open_violations !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Critical Issues */}
                {status.critical_issues && status.critical_issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Critical Issues:</div>
                    {status.critical_issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming Deadlines */}
                {status.upcoming_deadlines && status.upcoming_deadlines.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Upcoming Deadlines:
                    </div>
                    {status.upcoming_deadlines.slice(0, 3).map((deadline: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-yellow-50 p-2 rounded">
                        <span>{deadline.rule_code}</span>
                        <Badge variant="outline">
                          {deadline.days_remaining} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Jurisdictional Badges */}
                <div className="flex gap-2 flex-wrap">
                  {status.eu_compliant && <Badge variant="default">EU Compliant ✓</Badge>}
                  {status.us_compliant && <Badge variant="default">US Compliant ✓</Badge>}
                  {status.cn_compliant && <Badge variant="default">CN Compliant ✓</Badge>}
                  {status.global_compliant && <Badge variant="default">Globally Compliant ✓</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PENDING CHANGES TAB */}
        <TabsContent value="changes" className="space-y-4">
          {pendingChanges.length > 0 ? (
            pendingChanges.map(change => (
              <Card key={change.id} className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-yellow-600" />
                        {change.change_title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {change.change_summary}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {change.jurisdiction}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Type</div>
                      <div className="font-medium capitalize">{change.change_type.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Effective Date</div>
                      <div className="font-medium">
                        {change.effective_date 
                          ? new Date(change.effective_date).toLocaleDateString()
                          : 'TBD'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Detection Method</div>
                      <div className="font-medium capitalize">{change.detection_method.replace(/_/g, ' ')}</div>
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  {change.impact_assessment && (
                    <div className="bg-white rounded p-3 border border-yellow-200">
                      <div className="font-medium text-sm mb-2">AI Impact Assessment:</div>
                      <div className="text-sm text-gray-700">{change.impact_assessment}</div>
                    </div>
                  )}

                  {/* Affected Systems */}
                  {change.affected_systems && change.affected_systems.length > 0 && (
                    <div>
                      <div className="font-medium text-sm mb-2">Affected Systems:</div>
                      <div className="flex gap-2 flex-wrap">
                        {change.affected_systems.map(system => (
                          <Badge key={system} variant="secondary" className="capitalize">
                            {system.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Deploy
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Review Details
                    </Button>
                    <Button size="sm" variant="destructive">
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Changes</h3>
                <p className="text-gray-600">
                  All detected regulatory changes have been reviewed and processed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ACTIVE RULES TAB */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Rules</CardTitle>
              <CardDescription>
                Currently enforced regulations across all jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Rules list implementation pending...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceDashboard;
