import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AssetProtectionStrategy, romanAdvancedStrategy } from '@/services/romanAdvancedStrategy';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Lock,
  Scale,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function RomanStrategyPanel({ userId, debtAccountId }: { userId: string; debtAccountId?: string }) {
  const [strategy, setStrategy] = useState<AssetProtectionStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'layers' | 'actions'>('overview');

  const loadStrategy = useCallback(async () => {
    try {
      setLoading(true);
      const result = await romanAdvancedStrategy.analyzeAssetProtection(userId, debtAccountId);
      setStrategy(result);
    } catch (error) {
      console.error('Strategy analysis error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, debtAccountId]);

  useEffect(() => {
    loadStrategy();
  }, [loadStrategy]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700">
        <CardContent className="p-12 text-center">
          <Zap className="w-12 h-12 text-purple-300 animate-pulse mx-auto mb-4" />
          <p className="text-white">R.O.M.A.N. analyzing 51-dimensional strategy...</p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) return null;

  const getStrengthColor = (strength: number) => {
    if (strength >= 75) return 'text-green-400';
    if (strength >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 75) return <Badge className="bg-green-600">STRONG</Badge>;
    if (strength >= 50) return <Badge className="bg-yellow-600">MODERATE</Badge>;
    return <Badge className="bg-red-600">WEAK</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-6 h-6" />
                R.O.M.A.N. 51-D Strategic Analysis
              </CardTitle>
              <CardDescription className="text-purple-200">
                Advanced Asset Protection & Legal Defense Strategy
              </CardDescription>
            </div>
            {getStrengthBadge(strategy.defenseStrength)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-purple-200 mb-1">Defense Strength</div>
              <div className={`text-3xl font-bold ${getStrengthColor(strategy.defenseStrength)}`}>
                {strategy.defenseStrength}%
              </div>
              <Progress value={strategy.defenseStrength} className="mt-2" />
            </div>
            <div>
              <div className="text-sm text-purple-200 mb-1">Implementation Cost</div>
              <div className="text-3xl font-bold text-white">
                ${strategy.estimatedCost.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-purple-200 mb-1">Timeframe</div>
              <div className="text-2xl font-bold text-white">
                {strategy.timeToImplement}
              </div>
            </div>
          </div>

          <Alert className="mt-4 bg-purple-800 border-purple-600">
            <Scale className="h-4 w-4" />
            <AlertDescription className="text-white">
              <strong>Strategic Approach:</strong> {strategy.overallApproach}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'layers' ? 'default' : 'outline'}
          onClick={() => setActiveTab('layers')}
        >
          Protection Layers
        </Button>
        <Button 
          variant={activeTab === 'actions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('actions')}
        >
          Action Plan
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Corporate Shield
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">LLC Protection:</span>
                  <span className="text-white font-bold">
                    {strategy.corporateShield.hasLLC ? '✅ Active' : '❌ None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Veil Piercing Risk:</span>
                  <Badge className={
                    strategy.corporateShield.veilPiercingRisk === 'LOW' ? 'bg-green-600' :
                    strategy.corporateShield.veilPiercingRisk === 'MEDIUM' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }>
                    {strategy.corporateShield.veilPiercingRisk}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Personal Guarantees:</span>
                  <span className="text-white font-bold">
                    {strategy.corporateShield.personalGuarantees.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="w-5 h-5" />
                Trust Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Active Trusts:</span>
                  <span className="text-white font-bold">
                    {strategy.trustProtection.hasTrusts ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Creditor Protection:</span>
                  <span className="text-white font-bold">
                    {strategy.trustProtection.creditorProtection ? '✅ Active' : '❌ None'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  {strategy.trustProtection.revocableVsIrrevocable}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                UCC-1 Secured Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">UCC Filings:</span>
                  <span className="text-white font-bold">
                    {strategy.uccSecuredAssets.hasUCCFilings ? '✅ Active' : '❌ None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Protection Level:</span>
                  <Badge className={
                    strategy.uccSecuredAssets.protectionLevel === 'FULL' ? 'bg-green-600' :
                    strategy.uccSecuredAssets.protectionLevel === 'PARTIAL' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }>
                    {strategy.uccSecuredAssets.protectionLevel}
                  </Badge>
                </div>
                {strategy.uccSecuredAssets.securedAssets.length > 0 && (
                  <div className="text-xs text-slate-400 mt-2">
                    Secured: {strategy.uccSecuredAssets.securedAssets.join(', ')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Insurance Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Legal Defense:</span>
                  <span className="text-white font-bold">
                    {strategy.insuranceCoverage.legalDefenseCoverage ? '✅ Covered' : '❌ None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Can Litigate:</span>
                  <span className="text-white font-bold">
                    {strategy.insuranceCoverage.canAffordLitigation ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Coverage Limit:</span>
                  <span className="text-white font-bold">
                    ${strategy.insuranceCoverage.estimatedCoverageLimit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Protection Layers Tab */}
      {activeTab === 'layers' && (
        <div className="space-y-4">
          {/* Layer 1: Corporate */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Layer 1: Corporate Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.corporateShield.recommendations.map((rec, i) => (
                  <Alert key={i} className={
                    rec.includes('✅') ? 'bg-green-900 border-green-700' :
                    rec.includes('🚨') || rec.includes('⚠️') ? 'bg-red-900 border-red-700' :
                    'bg-blue-900 border-blue-700'
                  }>
                    <AlertDescription className="text-white">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layer 2: Trust */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Layer 2: Trust Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.trustProtection.recommendations.map((rec, i) => (
                  <Alert key={i} className={
                    rec.includes('✅') ? 'bg-green-900 border-green-700' :
                    rec.includes('⚠️') ? 'bg-yellow-900 border-yellow-700' :
                    'bg-blue-900 border-blue-700'
                  }>
                    <AlertDescription className="text-white">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layer 3: UCC */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Layer 3: UCC-1 Secured Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.uccSecuredAssets.recommendations.map((rec, i) => (
                  <Alert key={i} className={
                    rec.includes('✅') ? 'bg-green-900 border-green-700' :
                    'bg-blue-900 border-blue-700'
                  }>
                    <AlertDescription className="text-white">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layer 4: Insurance */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Layer 4: Insurance Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.insuranceCoverage.recommendations.map((rec, i) => (
                  <Alert key={i} className={
                    rec.includes('✅') ? 'bg-green-900 border-green-700' :
                    rec.includes('⚠️') ? 'bg-yellow-900 border-yellow-700' :
                    'bg-blue-900 border-blue-700'
                  }>
                    <AlertDescription className="text-white">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layer 5: Bankruptcy */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Layer 5: Bankruptcy Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.bankruptcyAnalysis.recommendations.map((rec, i) => (
                  <Alert key={i} className="bg-purple-900 border-purple-700">
                    <AlertDescription className="text-white">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          {/* Immediate Actions */}
          {strategy.immediateActions.length > 0 && (
            <Card className="bg-red-900 border-red-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  IMMEDIATE (Do Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.immediateActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-white">
                      <span className="font-bold">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Short Term */}
          {strategy.shortTerm.length > 0 && (
            <Card className="bg-yellow-900 border-yellow-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  SHORT TERM (1-3 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.shortTerm.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-white">
                      <span className="font-bold">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Long Term */}
          {strategy.longTerm.length > 0 && (
            <Card className="bg-blue-900 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  LONG TERM (3-12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.longTerm.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-white">
                      <span className="font-bold">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Preventive Measures */}
          <Card className="bg-green-900 border-green-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                PREVENTIVE MEASURES (Ongoing)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strategy.preventiveMeasures.map((measure, i) => (
                  <li key={i} className="flex items-start gap-2 text-white">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
