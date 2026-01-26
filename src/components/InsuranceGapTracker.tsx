/**
 * Insurance Gap Tracker Component
 * 
 * Visual dashboard showing coverage gaps and policy recommendations.
 * Alerts user to critical exposures (personal guarantees, contractual liability).
 * 
 * Created: January 17, 2026
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { insuranceGapAnalyzer } from '@/services/insuranceGapAnalyzer';
import { AlertTriangle, CheckCircle2, DollarSign, FileText, Shield, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function InsuranceGapTracker() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      // TODO: Get actual user ID from auth
      const result = await insuranceGapAnalyzer.analyzeInsuranceGaps('user-id');
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing coverage gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MODERATE': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-red-500 bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-blue-500 bg-blue-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white text-xl">Analyzing coverage gaps...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert className="bg-red-900/20 border-red-500">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <AlertDescription className="text-red-300">
          Failed to load insurance gap analysis. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const gapCost = insuranceGapAnalyzer.calculateTotalGapCost(analysis);

  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${analysis.total_debt_analyzed.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300">Covered Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 flex items-center gap-2">
              ${analysis.total_covered_debt.toLocaleString()}
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300">Uncovered Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400 flex items-center gap-2">
              ${analysis.total_uncovered_debt.toLocaleString()}
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-300">Coverage %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {Math.round(analysis.coverage_percentage)}%
            </div>
            <Progress value={analysis.coverage_percentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {analysis.coverage_percentage < 50 && (
        <Alert className="bg-red-900/20 border-red-500 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <AlertTitle className="text-white text-lg">CRITICAL COVERAGE GAP</AlertTitle>
          <AlertDescription className="text-red-300">
            Only {Math.round(analysis.coverage_percentage)}% of your debt is covered by insurance. 
            ${analysis.total_uncovered_debt.toLocaleString()} in debt has NO legal defense coverage.
            <br /><br />
            <strong>Immediate risk:</strong> If creditors sue, you will pay attorney fees out of pocket (typically $5,000-$15,000 per case).
          </AlertDescription>
        </Alert>
      )}

      {/* Recommended Policies */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Recommended Insurance Policies
          </CardTitle>
          <CardDescription className="text-slate-400">
            Close coverage gaps with these policies (sorted by urgency)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.recommended_policies.map((policy: any, index: number) => (
            <Card key={index} className={`border-2 ${getPriorityColor(policy.priority)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{policy.policy_type}</CardTitle>
                  <Badge className={getSeverityColor(policy.priority === 'URGENT' ? 'CRITICAL' : policy.priority)}>
                    {policy.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Coverage Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Coverage Limit</p>
                    <p className="text-white font-semibold">${(policy.coverage_limit / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Annual Premium</p>
                    <p className="text-green-400 font-semibold">${policy.estimated_premium.toLocaleString()}/year</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Debt Protected</p>
                    <p className="text-blue-400 font-semibold">${policy.total_debt_protected.toLocaleString()}</p>
                  </div>
                </div>

                {/* Creditors Covered */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Creditors This Policy Covers:</p>
                  <div className="flex flex-wrap gap-2">
                    {policy.debts_it_covers.slice(0, 5).map((creditor: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-slate-800 text-slate-300 border-slate-600">
                        {creditor}
                      </Badge>
                    ))}
                    {policy.debts_it_covers.length > 5 && (
                      <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-600">
                        +{policy.debts_it_covers.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* ROI */}
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Protection ROI</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {Math.round((policy.total_debt_protected / policy.estimated_premium) * 100).toLocaleString()}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    ${policy.estimated_premium.toLocaleString()} premium protects ${policy.total_debt_protected.toLocaleString()} in debt
                  </p>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Get Quote for {policy.policy_type}
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Total Cost to Close Gaps */}
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            Total Cost to Close All Coverage Gaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-sm">Total Annual Premium</p>
              <p className="text-2xl font-bold text-green-400">
                ${gapCost.total_annual_premium.toLocaleString()}/year
              </p>
              <p className="text-slate-400 text-xs mt-1">~${Math.round(gapCost.total_annual_premium / 12).toLocaleString()}/month</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-sm">Debt Protected</p>
              <p className="text-2xl font-bold text-blue-400">
                ${gapCost.total_debt_protected.toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs mt-1">Legal defense coverage activated</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-slate-400 text-sm">Protection ROI</p>
              <p className="text-2xl font-bold text-purple-400">
                {Math.round(gapCost.roi_percentage).toLocaleString()}%
              </p>
              <p className="text-slate-400 text-xs mt-1">Return on insurance investment</p>
            </div>
          </div>

          <Alert className="bg-blue-900/20 border-blue-500">
            <AlertDescription className="text-blue-200">
              <strong>Strategic Value:</strong> With full coverage, creditors cannot financially drain you through legal fees. 
              Insurance companies negotiate aggressively and settle quickly - creditors know this and often drop cases when you have coverage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Specific Coverage Gaps */}
      {analysis.gaps.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Specific Coverage Gaps ({analysis.gaps.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Individual debts with NO insurance coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.gaps.map((gap: any, index: number) => (
              <Alert key={index} className={`${getSeverityColor(gap.severity)} bg-opacity-20 border-2`}>
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle className="text-white flex items-center justify-between">
                  <span>{gap.creditor}</span>
                  <Badge className={getSeverityColor(gap.severity)}>
                    {gap.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="text-slate-300 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Debt Amount:</span>
                    <span className="font-semibold">${gap.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gap Type:</span>
                    <span className="font-semibold text-red-300">{gap.gap_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-sm mt-2">{gap.reasoning}</p>
                  <div className="p-2 bg-slate-800 rounded mt-2">
                    <p className="text-blue-300 text-sm">
                      <strong>Recommended:</strong> {gap.recommended_policy} (~${gap.estimated_annual_premium.toLocaleString()}/year)
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
