/**
 * ============================================================================
 * PERPETUAL COMPLIANCE DASHBOARD
 * ============================================================================
 * Multi-jurisdictional compliance monitoring with AI learning visualization
 * Shows: All requirements, predictions, auto-completed items, violations
 * ============================================================================
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { perpetualComplianceEngine } from '@/services/perpetualComplianceEngine';
import { supabase } from '@/services/supabase';
import {
    AlertTriangle,
    Brain,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileCheck,
    Globe,
    MapPin,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface JurisdictionStatus {
  id: string;
  jurisdiction_name: string;
  jurisdiction_type: string;
  monitoring_tier: string;
  total_rules: number;
  active_requirements: number;
  customer_count: number;
  ai_prediction_accuracy: number;
  last_monitored_at: string;
}

interface ComplianceObligation {
  id: string;
  obligation_title: string;
  obligation_type: string;
  due_date: string;
  status: string;
  can_ai_complete: boolean;
  ai_confidence_score: number;
  jurisdiction_name: string;
  cost_usd: number;
}

interface AIPrediction {
  id: string;
  jurisdiction_name: string;
  regulation_topic: string;
  predicted_change: string;
  prediction_confidence: number;
  prediction_effective_date: string;
  prediction_accuracy: number | null;
  validated_at: string | null;
}

export default function PerpetualComplianceDashboard() {
  const [jurisdictions, setJurisdictions] = useState<JurisdictionStatus[]>([]);
  const [obligations, setObligations] = useState<ComplianceObligation[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Summary stats
  const [stats, setStats] = useState({
    total_jurisdictions: 0,
    monitored_jurisdictions: 0,
    pending_obligations: 0,
    overdue_obligations: 0,
    ai_completed_count: 0,
    active_predictions: 0,
    avg_prediction_accuracy: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJurisdictions(),
        loadObligations(),
        loadPredictions(),
        loadStats()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJurisdictions = async () => {
    const { data, error } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('monitoring_enabled', true)
      .order('monitoring_tier')
      .limit(50);

    if (!error && data) {
      setJurisdictions(data);
    }
  };

  const loadObligations = async () => {
    const { data, error } = await supabase
      .from('compliance_obligations')
      .select(`
        *,
        jurisdiction:jurisdictions(jurisdiction_name)
      `)
      .in('status', ['pending', 'in_progress', 'overdue'])
      .order('due_date')
      .limit(100);

    if (!error && data) {
      setObligations(data);
    }
  };

  const loadPredictions = async () => {
    const { data, error } = await supabase
      .from('regulation_learning_model')
      .select(`
        id,
        regulation_topic,
        predicted_change,
        prediction_confidence,
        prediction_effective_date,
        prediction_accuracy,
        validated_at,
        jurisdiction:jurisdictions(jurisdiction_name)
      `)
      .order('prediction_effective_date')
      .limit(50);

    if (!error && data) {
      setPredictions(data.map((p: any) => ({
        ...p,
        jurisdiction_name: p.jurisdiction?.jurisdiction_name || 'Unknown'
      })));
    }
  };

  const loadStats = async () => {
    // Count jurisdictions
    const { count: totalJurisdictions } = await supabase
      .from('jurisdictions')
      .select('*', { count: 'exact', head: true });

    const { count: monitoredJurisdictions } = await supabase
      .from('jurisdictions')
      .select('*', { count: 'exact', head: true })
      .eq('monitoring_enabled', true);

    // Count obligations
    const { count: pendingObligations } = await supabase
      .from('compliance_obligations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']);

    const { count: overdueObligations } = await supabase
      .from('compliance_obligations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'overdue');

    const { count: aiCompletedCount } = await supabase
      .from('compliance_obligations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .not('ai_attempted_at', 'is', null);

    // Count predictions
    const { count: activePredictions } = await supabase
      .from('regulation_learning_model')
      .select('*', { count: 'exact', head: true })
      .is('validated_at', null);

    // Calculate average prediction accuracy
    const { data: accuracyData } = await supabase
      .from('regulation_learning_model')
      .select('prediction_accuracy')
      .not('prediction_accuracy', 'is', null);

    const avgAccuracy = accuracyData && accuracyData.length > 0
      ? accuracyData.reduce((sum, p) => sum + (p.prediction_accuracy || 0), 0) / accuracyData.length
      : 0;

    setStats({
      total_jurisdictions: totalJurisdictions || 0,
      monitored_jurisdictions: monitoredJurisdictions || 0,
      pending_obligations: pendingObligations || 0,
      overdue_obligations: overdueObligations || 0,
      ai_completed_count: aiCompletedCount || 0,
      active_predictions: activePredictions || 0,
      avg_prediction_accuracy: avgAccuracy
    });
  };

  const handleAutoComplete = async (obligationId: string) => {
    try {
      const result = await perpetualComplianceEngine.orchestrator.autoCompleteRequirement(obligationId);
      
      if (result.success) {
        alert(`✅ AI completed: ${result.reason}\nConfirmation: ${result.confirmation}`);
        loadDashboardData(); // Refresh
      } else {
        alert(`❌ Cannot auto-complete: ${result.reason}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleRunMonitoring = async () => {
    try {
      setLoading(true);
      await perpetualComplianceEngine.runDailyCycle();
      await loadDashboardData();
      alert('✅ Monitoring complete! Check the Predictions tab for new insights.');
    } catch (error) {
      alert(`❌ Monitoring failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'critical': return 'bg-red-500';
      case 'important': return 'bg-orange-500';
      case 'standard': return 'bg-yellow-500';
      case 'background': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Perpetual Compliance Engine
          </h1>
          <p className="text-gray-600 mt-2">
            Multi-jurisdictional monitoring • AI learning • 20-year vision
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={handleRunMonitoring} disabled={loading}>
          <Zap className="h-4 w-4 mr-2" />
          {loading ? 'Monitoring...' : 'Run Monitoring Now'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jurisdictions Monitored</p>
                <p className="text-2xl font-bold">{stats.monitored_jurisdictions}</p>
                <p className="text-xs text-gray-500">of {stats.total_jurisdictions} total</p>
              </div>
              <MapPin className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Obligations</p>
                <p className="text-2xl font-bold">{stats.pending_obligations}</p>
                {stats.overdue_obligations > 0 && (
                  <p className="text-xs text-red-600">{stats.overdue_obligations} overdue!</p>
                )}
              </div>
              <FileCheck className="h-10 w-10 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Auto-Completed</p>
                <p className="text-2xl font-bold">{stats.ai_completed_count}</p>
                <p className="text-xs text-gray-500">forms filed automatically</p>
              </div>
              <Zap className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Prediction Accuracy</p>
                <p className="text-2xl font-bold">{stats.avg_prediction_accuracy.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{stats.active_predictions} active predictions</p>
              </div>
              <Brain className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="jurisdictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jurisdictions">
            <MapPin className="h-4 w-4 mr-2" />
            Jurisdictions
          </TabsTrigger>
          <TabsTrigger value="obligations">
            <FileCheck className="h-4 w-4 mr-2" />
            Obligations ({stats.pending_obligations})
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="h-4 w-4 mr-2" />
            AI Predictions ({stats.active_predictions})
          </TabsTrigger>
          <TabsTrigger value="learning">
            <Brain className="h-4 w-4 mr-2" />
            AI Learning
          </TabsTrigger>
        </TabsList>

        {/* Jurisdictions Tab */}
        <TabsContent value="jurisdictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitored Jurisdictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jurisdictions.slice(0, 20).map((jurisdiction) => (
                  <div
                    key={jurisdiction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getTierColor(jurisdiction.monitoring_tier)}>
                        {jurisdiction.monitoring_tier}
                      </Badge>
                      <div>
                        <p className="font-medium">{jurisdiction.jurisdiction_name}</p>
                        <p className="text-sm text-gray-600">
                          {jurisdiction.jurisdiction_type} • {jurisdiction.customer_count} customers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        AI Accuracy: {jurisdiction.ai_prediction_accuracy.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Last checked: {jurisdiction.last_monitored_at 
                          ? formatDate(jurisdiction.last_monitored_at)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligations Tab */}
        <TabsContent value="obligations" className="space-y-4">
          {stats.overdue_obligations > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.overdue_obligations} obligations are overdue! Take immediate action.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Compliance Obligations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {obligations.map((obligation) => (
                  <div
                    key={obligation.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(obligation.status)}>
                          {obligation.status}
                        </Badge>
                        <Badge variant="outline">{obligation.obligation_type}</Badge>
                        {obligation.can_ai_complete && (
                          <Badge variant="outline" className="bg-green-50">
                            <Zap className="h-3 w-3 mr-1" />
                            AI Can Complete
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{obligation.obligation_title}</p>
                      <p className="text-sm text-gray-600">
                        {obligation.jurisdiction_name} • Due: {formatDate(obligation.due_date)}
                      </p>
                      {obligation.cost_usd > 0 && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <DollarSign className="h-3 w-3" />
                          ${obligation.cost_usd.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {obligation.can_ai_complete && obligation.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleAutoComplete(obligation.id)}
                          disabled={loading}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-Complete
                        </Button>
                      )}
                      {obligation.ai_confidence_score > 0 && (
                        <p className="text-xs text-gray-500 text-center">
                          AI: {obligation.ai_confidence_score}% confident
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Regulatory Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {prediction.regulation_topic}
                        </Badge>
                        <p className="font-medium text-gray-800">
                          {prediction.jurisdiction_name}
                        </p>
                      </div>
                      <div className="text-right">
                        {prediction.validated_at ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Validated: {prediction.prediction_accuracy?.toFixed(1)}% accurate
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-500">
                            <Brain className="h-3 w-3 mr-1" />
                            {prediction.prediction_confidence.toFixed(0)}% confident
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{prediction.predicted_change}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Predicted for: {formatDate(prediction.prediction_effective_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Learning Tab */}
        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall AI Prediction Accuracy</span>
                  <span className="text-sm font-bold">{stats.avg_prediction_accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={stats.avg_prediction_accuracy} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Based on {predictions.filter(p => p.validated_at).length} validated predictions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Total Jurisdictions</p>
                  <p className="text-2xl font-bold">{stats.total_jurisdictions}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Active Predictions</p>
                  <p className="text-2xl font-bold">{stats.active_predictions}</p>
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>How AI Learns:</strong> The system analyzes historical regulation changes, 
                  identifies patterns, makes predictions, and validates accuracy. Over 20 years, 
                  accuracy will increase to 99%+ as the AI learns from thousands of validated predictions.
                </AlertDescription>
              </Alert>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">20-Year Vision Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>2025-2027: Foundation (Current)</span>
                      <span className="font-medium">In Progress</span>
                    </div>
                    <Progress value={65} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>2028-2030: Expansion</span>
                      <span className="text-gray-400">Not Started</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>2031-2035: Intelligence</span>
                      <span className="text-gray-400">Not Started</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>2036-2045: Transcendence</span>
                      <span className="text-gray-400">Not Started</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}