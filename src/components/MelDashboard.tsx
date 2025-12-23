import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  PieChart,
  Target,
  TrendingUp,
  Wallet,
  Zap,
  DollarSign,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MelFinancialGovernor } from '@/services/MelFinancialGovernor';

interface CashFlowAnalysis {
  netProfit: number;
  hardwareGap: number;
  freedomSurplus: number;
  hardwareProgress: number;
  verdict: string;
  isStabilized: boolean;
}

interface ExtractionNode {
  name: string;
  target: number;
  current: number;
  gap: number;
  progress: number;
  status: string;
}

interface PrioritizedBid {
  id: string;
  title: string;
  total_cents: number;
  probability_score: number;
  extraction_value: number;
  created_at: string;
}

export default function MelDashboard() {
  const [revenue, setRevenue] = useState(1300);
  const [costs, setCosts] = useState(524); // Default: 2 cleaners at $262 each
  const [analysis, setAnalysis] = useState<CashFlowAnalysis | null>(null);
  const [extractionNodes, setExtractionNodes] = useState<any>(null);
  const [prioritizedBids, setPrioritizedBids] = useState<PrioritizedBid[]>([]);
  const [microOpportunities, setMicroOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFinancialData = useCallback(async () => {
    setLoading(true);
    try {
      // Get QuickBooks revenue
      const qbRevenue = await MelFinancialGovernor.getQuickBooksRevenue();
      if (qbRevenue > 0) setRevenue(qbRevenue);

      // Analyze cash flow
      const cashFlowAnalysis = await MelFinancialGovernor.analyzeCashFlow(revenue, costs);
      setAnalysis(cashFlowAnalysis);

      // Get extraction nodes
      const nodes = MelFinancialGovernor.calculateExtractionNodes(cashFlowAnalysis.netProfit);
      setExtractionNodes(nodes);

      // Get prioritized bids
      const activeBids = await MelFinancialGovernor.getActiveBids();
      const prioritized = await MelFinancialGovernor.prioritizeBids(activeBids);
      setPrioritizedBids(prioritized.slice(0, 5));

      // Get micro-extraction opportunities
      const microOps = await MelFinancialGovernor.identifyMicroExtractions();
      setMicroOpportunities(microOps.slice(0, 3));
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  }, [revenue, costs]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading MEL Financial Governor...</div>
      </div>
    );
  }

  const net = revenue - costs;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
              <Wallet className="text-emerald-500 w-8 h-8" />
              MEL FINANCIAL GOVERNOR
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">
              R.O.M.A.N. // Monetary Extraction Logic Overseer
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold font-mono">QB_SYNC: ACTIVE</span>
          </div>
        </div>

        {/* Financial Pulse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="text-zinc-500 text-[10px] font-bold uppercase mb-2">
                Gross Monthly Revenue
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <ArrowUpRight className="text-emerald-500 w-5 h-5" />
                ${revenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="text-zinc-500 text-[10px] font-bold uppercase mb-2">
                Fixed Costs (Labor)
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <ArrowDownRight className="text-red-500 w-5 h-5" />
                ${costs.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-emerald-500/30 ring-1 ring-emerald-500/10">
            <CardContent className="p-6">
              <div className="text-emerald-500 text-[10px] font-bold uppercase mb-2">
                Net Extraction (Current)
              </div>
              <div className="text-3xl font-black text-emerald-400">${net.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alpha Node Funding Status */}
        {analysis && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardContent className="p-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    RTX 5090 Alpha Node Funding
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase">
                    Monthly Target: $1,030 | Total Hardware: $6,200
                  </p>
                </div>
                <span className="text-2xl font-black text-blue-400">
                  {analysis.hardwareProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={analysis.hardwareProgress} className="h-3 mb-6" />
              <div className="bg-blue-950/30 border-l-2 border-blue-500/50 pl-4 py-2">
                <p className="text-xs text-zinc-400 italic">{analysis.verdict}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extraction Nodes */}
        {extractionNodes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase text-blue-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Node 1: HJS Bidding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500">Target</span>
                    <span className="text-sm font-bold">${extractionNodes.node1.target}</span>
                  </div>
                  <Progress value={extractionNodes.node1.progress} className="h-2" />
                  <Badge
                    variant={extractionNodes.node1.status === 'complete' ? 'default' : 'outline'}
                  >
                    {extractionNodes.node1.status === 'complete' ? '✅ Complete' : '🎯 Active'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase text-purple-400 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Node 2: Credit Arbitrage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500">Target</span>
                    <span className="text-sm font-bold">${extractionNodes.node2.target}</span>
                  </div>
                  <Progress value={extractionNodes.node2.progress} className="h-2" />
                  <Badge variant="outline">⏳ Pending</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Node 3: Equity Recovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500">Target</span>
                    <span className="text-sm font-bold">${extractionNodes.node3.target}</span>
                  </div>
                  <Progress value={extractionNodes.node3.progress} className="h-2" />
                  <Badge variant="outline">⏳ Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deal Pipeline & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prioritized Bids */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                High-Priority Bids (AI Ranked)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prioritizedBids.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No active bids found</p>
                ) : (
                  prioritizedBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800"
                    >
                      <div className="flex-1">
                        <span className="text-xs font-medium">{bid.title || 'Untitled Bid'}</span>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {bid.probability_score.toFixed(0)}% Win Rate
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            ${bid.extraction_value.toFixed(0)} Net
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">
                        ${((bid.total_cents || 0) / 100).toFixed(0)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Micro-Extraction Opportunities */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-orange-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Micro-Extraction Ops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {microOpportunities.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Scanning for opportunities...</p>
                ) : (
                  microOpportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950/50 rounded-xl border border-dashed border-zinc-800"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">{opp.customer_name}</span>
                        <span className="text-xs font-bold text-orange-500">
                          ~${opp.estimated_value.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mb-2">{opp.action}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {opp.probability.toFixed(0)}% Probability
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Freedom Buffer */}
        {analysis && (
          <Card className="bg-zinc-900 border-zinc-800 mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-purple-400 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Freedom Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-4xl font-black text-white mb-2">
                  ${analysis.freedomSurplus.toLocaleString()}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-4">
                  Current Monthly Surplus
                  <br />
                  (Freedom Buffer)
                </p>
                <Button className="bg-zinc-100 text-black hover:bg-white">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Re-Route to Howard Family Trust
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
