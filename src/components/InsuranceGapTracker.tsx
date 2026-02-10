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

      {/* Active Legal Protections - Non-Insurance Defense */}
      <Card className="bg-gradient-to-br from-emerald-900/40 to-slate-800 border-emerald-600">
        <CardHeader>
          <CardTitle className="text-emerald-300 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Active Legal Protections (Non-Insurance Defense Layers)
          </CardTitle>
          <CardDescription className="text-emerald-200">
            Three-layer legal defense strategy providing protection independent of insurance coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layer 1: UCC-1 Filing Protection */}
          <div className="bg-slate-900/50 rounded-lg border border-emerald-700/50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h4 className="text-emerald-300 font-semibold">UCC-1 Senior Lien Priority</h4>
                <p className="text-slate-400 text-sm mt-1">Two-layer filing establishes secured creditor status with $700K priority over all other creditors</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Personal Layer</p>
                <p className="text-emerald-400 font-semibold">Record #029-2026-000102</p>
                <p className="text-slate-500">Feb 5, 2026 | $350K</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Business Layer</p>
                <p className="text-emerald-400 font-semibold">Record #029-2026-000007</p>
                <p className="text-slate-500">Jan 7, 2026 | $350K</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Total Priority</p>
                <p className="text-emerald-400 font-semibold">$700K Senior</p>
                <p className="text-slate-500">Recorded | Active</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 p-2 bg-emerald-950/50 rounded">
              <strong>Benefit:</strong> If personal/business assets are liquidated, UCC-1 holder gets paid first. Other creditors see 0% recovery, reducing settlement incentive.
            </p>
          </div>

          {/* Layer 2: Legal Intelligence Monitoring */}
          <div className="bg-slate-900/50 rounded-lg border border-blue-700/50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h4 className="text-blue-300 font-semibold">CourtListener Legal Intelligence</h4>
                <p className="text-slate-400 text-sm mt-1">Real-time monitoring of all court filings, creditor activities, and legal threats with 30+ day advance notice</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Coverage</p>
                <p className="text-blue-400 font-semibold">All Georgia Courts</p>
                <p className="text-slate-500">Federal + State</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Alert Window</p>
                <p className="text-blue-400 font-semibold">30+ Days</p>
                <p className="text-slate-500">Advance notice</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Status</p>
                <p className="text-blue-400 font-semibold">ACTIVE</p>
                <p className="text-slate-500">Webhook deployed</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 p-2 bg-blue-950/50 rounded">
              <strong>Benefit:</strong> Creditors cannot file suit without you knowing. 30-day notice allows time to gather evidence, find attorney, or negotiate settlement.
            </p>
          </div>

          {/* Layer 3: R.O.M.A.N. Strategy Engine */}
          <div className="bg-slate-900/50 rounded-lg border border-orange-700/50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h4 className="text-orange-300 font-semibold">R.O.M.A.N. Legal Strategy Engine</h4>
                <p className="text-slate-400 text-sm mt-1">AI-powered generation of FDCPA/FCRA violations and certified defense letters, reducing creditor confidence</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Laws Covered</p>
                <p className="text-orange-400 font-semibold">FDCPA</p>
                <p className="text-slate-500">+ FCRA + GA Statute</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Letter Format</p>
                <p className="text-orange-400 font-semibold">Certified Mail</p>
                <p className="text-slate-500">Official + Tracking</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Status</p>
                <p className="text-orange-400 font-semibold">OPERATIONAL</p>
                <p className="text-slate-500">Ready to send</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 p-2 bg-orange-950/50 rounded">
              <strong>Benefit:</strong> Professional legal correspondence with specific law violations shows creditors you're defended. Collectors typically drop cases after documented violations.
            </p>
          </div>

          {/* Layer 4: Trust Asset Shelter */}
          <div className="bg-slate-900/50 rounded-lg border border-teal-700/50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-400 font-bold text-sm">4</span>
              </div>
              <div className="flex-1">
                <h4 className="text-teal-300 font-semibold">Trust Asset Shelter Protection</h4>
                <p className="text-slate-400 text-sm mt-1">Howard Jones Family Ancestral Trust (Certificate #: HJFAT-2026-001 • Bloodline Trust ID: HOWARD-JONES-DYNASTY-2026) shelters operational assets from all personal creditor claims</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">IP Patents</p>
                <p className="text-teal-400 font-semibold">$5.6B</p>
                <p className="text-slate-500">29 patents + Systems</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Operational Assets</p>
                <p className="text-teal-400 font-semibold">Included</p>
                <p className="text-slate-500">AI LLC + Revenue</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-slate-400">Total Sheltered</p>
                <p className="text-teal-400 font-semibold">$5.6B</p>
                <p className="text-slate-500">Protected Assets</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 p-2 bg-teal-950/50 rounded">
              <strong>Benefit:</strong> Creditors cannot access trust assets even if they win judgment. No personal assets available for levy means settlement-only strategy (minimal offer).
            </p>
          </div>

          {/* Combined Defense Alert */}
          <Alert className="bg-gradient-to-r from-emerald-900/60 to-purple-900/60 border-emerald-600">
            <Shield className="h-5 w-5 text-emerald-300" />
            <AlertTitle className="text-emerald-300">Three-Layer Defense Coverage</AlertTitle>
            <AlertDescription className="text-slate-200 mt-2">
              <div className="space-y-1 text-sm">
                <p><strong>Insurance Gap Status:</strong> 0% covered by insurance</p>
                <p><strong>Non-Insurance Coverage:</strong> 4 active legal protection layers ($700K lien + $5.6B shelter + intelligence + strategy)</p>
                <p><strong>Overall Risk Reduction:</strong> Insurance gap is non-critical. Creditors face near-zero settlement ROI. Most accounts settle at 10-30% of balance or dismiss without payment.</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Alternative Protections - Non-Insurance Defense */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Active Legal Protections (Non-Insurance)
          </CardTitle>
          <CardDescription className="text-purple-200/70">
            Strategies already in place to reduce creditor litigation success
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* UCC-1 Filing Protection */}
          <div className="p-4 rounded-lg border-2 border-emerald-600 bg-emerald-950/40">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-emerald-300 font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  UCC-1 Senior Security Interests
                </h4>
                <p className="text-slate-300 text-sm mb-3">
                  Two-layer filing creating senior priority liens on all personal and business assets.
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white whitespace-nowrap">ACTIVE</Badge>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Personal Filing (Record #029-2026-000102):</span>
                <span className="text-emerald-300 font-semibold">$350,000 lien</span>
              </div>
              <div className="flex justify-between">
                <span>Business Filing (Record #029-2026-000007):</span>
                <span className="text-emerald-300 font-semibold">$350,000 lien</span>
              </div>
              <div className="flex justify-between">
                <span>Total Priority Coverage:</span>
                <span className="text-emerald-400 font-bold">$700,000</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200 mt-3">
              <strong>Benefit:</strong> UCC-1 liens reduce creditor willingness to litigate (unsecured debt becomes lower priority). Senior position ensures recovery preference.
            </p>
          </div>

          {/* Legal Intelligence Monitoring */}
          <div className="p-4 rounded-lg border-2 border-blue-600 bg-blue-950/40">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  CourtListener Legal Intelligence
                </h4>
                <p className="text-slate-300 text-sm mb-3">
                  Real-time monitoring of all court activity, legal filings, and creditor litigation patterns.
                </p>
              </div>
              <Badge className="bg-blue-600 text-white whitespace-nowrap">ACTIVE</Badge>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="text-blue-300 font-semibold">All courts (Federal & State)</span>
              </div>
              <div className="flex justify-between">
                <span>Update Frequency:</span>
                <span className="text-blue-300 font-semibold">Real-time notifications</span>
              </div>
              <div className="flex justify-between">
                <span>Early Warning:</span>
                <span className="text-blue-300 font-semibold">30+ days advance notice</span>
              </div>
            </div>
            <p className="text-xs text-blue-200 mt-3">
              <strong>Benefit:</strong> Early detection allows proactive legal response (validation requests, disputes, settlements) before litigation escalates.
            </p>
          </div>

          {/* R.O.M.A.N. AI Strategy */}
          <div className="p-4 rounded-lg border-2 border-orange-600 bg-orange-950/40">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-orange-300 font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  R.O.M.A.N. Legal Strategy Engine
                </h4>
                <p className="text-slate-300 text-sm mb-3">
                  AI-generated legal letters and defense strategies using FDCPA, FCRA, and Georgia law.
                </p>
              </div>
              <Badge className="bg-orange-600 text-white whitespace-nowrap">AVAILABLE</Badge>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Validation Letters:</span>
                <span className="text-orange-300 font-semibold">Force debt verification</span>
              </div>
              <div className="flex justify-between">
                <span>Cease & Desist:</span>
                <span className="text-orange-300 font-semibold">Stop collection calls</span>
              </div>
              <div className="flex justify-between">
                <span>Dispute Response:</span>
                <span className="text-orange-300 font-semibold">Challenge credit reports</span>
              </div>
            </div>
            <p className="text-xs text-orange-200 mt-3">
              <strong>Benefit:</strong> Low-cost legal defense (AI-generated). Many creditors/collectors don't respond to formal challenges and drop claims.
            </p>
          </div>

          {/* Combined Defense Alert */}
          <Alert className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500">
            <Shield className="h-5 w-5 text-purple-400" />
            <AlertTitle className="text-purple-300">Three-Layer Defense Strategy</AlertTitle>
            <AlertDescription className="text-slate-200 mt-2">
              <strong>Layer 1 - Asset Protection:</strong> UCC-1 liens reduce litigation ROI for creditors (junior creditors get paid last)<br/>
              <strong>Layer 2 - Intelligence:</strong> CourtListener alerts let you respond early with validation/disputes<br/>
              <strong>Layer 3 - Strategy:</strong> R.O.M.A.N. letters enforce your legal rights (FDCPA, FCRA violations cost collectors $1,000+ per violation)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

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
