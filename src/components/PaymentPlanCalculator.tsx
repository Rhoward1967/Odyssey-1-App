import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { strategicPaymentAnalyzer } from '@/services/strategicPaymentAnalyzer';
import {
  Calculator,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { useState } from 'react';

/**
 * Strategic Payment Plan Calculator
 * 
 * Analyzes each debt to determine optimal strategy:
 * - Pay full / Pay plan / Settle / Fight / Ignore
 * - ROI comparison across strategies
 * - Debt prioritization based on interest, statute, credit impact
 */

export function PaymentPlanCalculator({ userId }: { userId: string }) {
  const [monthlyCashFlow, setMonthlyCashFlow] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculatePlan = async () => {
    if (!monthlyCashFlow || parseFloat(monthlyCashFlow) <= 0) {
      alert('Enter available monthly cash flow');
      return;
    }

    try {
      setLoading(true);
      const plan = await strategicPaymentAnalyzer.createPaymentPlan(
        userId,
        parseFloat(monthlyCashFlow)
      );
      setPaymentPlan(plan);
    } catch (error) {
      console.error('Payment plan error:', error);
      alert('Failed to calculate payment plan');
    } finally {
      setLoading(false);
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'PAY_FULL': return 'bg-green-900 text-green-300 border-green-700';
      case 'PAY_PLAN': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'SETTLE': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'FIGHT': return 'bg-purple-900 text-purple-300 border-purple-700';
      case 'IGNORE': return 'bg-slate-900 text-slate-300 border-slate-700';
      default: return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getCreditImpactColor = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return 'text-green-400';
      case 'NEUTRAL': return 'text-yellow-400';
      case 'NEGATIVE': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Strategic Payment Plan Calculator
          </CardTitle>
          <CardDescription className="text-blue-200">
            Analyze each debt to determine optimal strategy: Pay, Settle, Fight, or Ignore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="cashflow" className="text-white">
                Monthly Cash Flow Available for Debt Payment
              </Label>
              <Input
                id="cashflow"
                type="number"
                step="100"
                value={monthlyCashFlow}
                onChange={(e) => setMonthlyCashFlow(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white mt-2"
                placeholder="500.00"
              />
              <p className="text-xs text-blue-200 mt-1">
                How much can you afford to pay total per month across all debts?
              </p>
            </div>
            <Button
              onClick={calculatePlan}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Calculate Strategy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {paymentPlan && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300">Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${paymentPlan.totalDebt.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300">Monthly Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ${paymentPlan.totalMonthlyPayment.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300">Payoff Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {paymentPlan.payoffMonths} months
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300">Total Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  ${paymentPlan.totalInterestPaid.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alternative Strategies Comparison */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Strategy Cost Comparison</CardTitle>
              <CardDescription className="text-slate-400">
                Total cost to resolve all debts using different approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-900 rounded-lg border border-yellow-700">
                  <h3 className="text-yellow-300 font-semibold mb-2">Settle All</h3>
                  <p className="text-3xl font-bold text-white">
                    ${paymentPlan.alternativeStrategies.settleAll.cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-200 mt-2">
                    ~{paymentPlan.alternativeStrategies.settleAll.months} months
                  </p>
                </div>

                <div className="p-4 bg-purple-900 rounded-lg border border-purple-700">
                  <h3 className="text-purple-300 font-semibold mb-2">Fight All</h3>
                  <p className="text-3xl font-bold text-white">
                    ${paymentPlan.alternativeStrategies.fightAll.cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-200 mt-2">
                    ~{paymentPlan.alternativeStrategies.fightAll.months} months
                  </p>
                </div>

                <div className="p-4 bg-blue-900 rounded-lg border border-blue-700">
                  <h3 className="text-blue-300 font-semibold mb-2">Mixed Strategy</h3>
                  <p className="text-3xl font-bold text-white">
                    ${paymentPlan.alternativeStrategies.mixedStrategy.cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-200 mt-2">
                    ~{paymentPlan.alternativeStrategies.mixedStrategy.months} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debt-by-Debt Strategy */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Prioritized Debt Strategy</CardTitle>
              <CardDescription className="text-slate-400">
                Sorted by priority (handle debts in this order)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentPlan.debtsByPriority.map((item: any) => (
                <Card key={item.debt.id} className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-900 text-blue-300 border-blue-700">
                            #{item.order}
                          </Badge>
                          {item.debt.creditor}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          ${item.debt.currentAmount.toLocaleString()} • {item.debt.accountType}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStrategyColor(item.strategy.strategy)}>
                        {item.strategy.strategy.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Priority Score */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Priority Score:</span>
                        <span className="text-white font-semibold">{item.strategy.priorityScore}/100</span>
                      </div>
                      <Progress value={item.strategy.priorityScore} className="h-2" />
                    </div>

                    {/* Strategy Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Total Cost</p>
                        <p className="text-lg font-bold text-white">
                          ${item.strategy.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Timeline</p>
                        <p className="text-lg font-bold text-white">
                          {item.strategy.timelineMonths} months
                        </p>
                      </div>
                      {item.monthlyPayment > 0 && (
                        <div>
                          <p className="text-xs text-slate-400">Monthly Payment</p>
                          <p className="text-lg font-bold text-green-400">
                            ${item.monthlyPayment.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-400">Credit Impact</p>
                        <p className={`text-lg font-bold ${getCreditImpactColor(item.strategy.estimatedCreditImpact)}`}>
                          {item.strategy.estimatedCreditImpact}
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <Alert className="bg-blue-900 border-blue-700">
                      <Scale className="h-4 w-4" />
                      <AlertTitle className="text-white">Why This Strategy?</AlertTitle>
                      <AlertDescription className="text-blue-200">
                        {item.strategy.reasoning}
                      </AlertDescription>
                    </Alert>

                    {/* Action Plan */}
                    <Alert className="bg-green-900 border-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle className="text-white">Action Plan</AlertTitle>
                      <AlertDescription className="text-green-200 whitespace-pre-line text-sm">
                        {item.strategy.recommendedAction}
                      </AlertDescription>
                    </Alert>

                    {/* Cost Comparison */}
                    <div className="pt-2 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">
                        Alternative Strategy Costs
                      </h4>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Pay Full</p>
                          <p className="text-white font-semibold">
                            ${item.strategy.costComparison.payFull.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Pay Plan</p>
                          <p className="text-white font-semibold">
                            ${item.strategy.costComparison.payPlan.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Settle</p>
                          <p className="text-white font-semibold">
                            ${item.strategy.costComparison.settle.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Fight</p>
                          <p className="text-white font-semibold">
                            ${item.strategy.costComparison.fight.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Legal Risk */}
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded">
                      <span className="text-sm text-slate-400">Legal Risk:</span>
                      <Badge variant="outline" className={getRiskColor(item.strategy.legalRisk)}>
                        {item.strategy.legalRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
