import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AlertTriangle, TrendingUp, DollarSign, Target, CheckCircle, XCircle } from 'lucide-react';

interface BudgetComparison {
  category: string;
  currentPlan: number;
  odysseyPlan: number;
  variance: number;
  status: 'critical' | 'warning' | 'good';
  recommendation: string;
}

export function OdysseyBudgetAnalysis() {
  const [comparisons, setComparisons] = useState<BudgetComparison[]>([]);
  const [totalVariance, setTotalVariance] = useState(0);
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(0);

  useEffect(() => {
    generateAnalysis();
  }, []);

  const generateAnalysis = () => {
    const budgetData: BudgetComparison[] = [
      {
        category: 'API & Cloud Services',
        currentPlan: 2500,
        odysseyPlan: 1800,
        variance: -700,
        status: 'good',
        recommendation: 'Optimize API calls, implement caching'
      },
      {
        category: 'Database Operations',
        currentPlan: 1200,
        odysseyPlan: 800,
        variance: -400,
        status: 'good',
        recommendation: 'Use query optimization, connection pooling'
      },
      {
        category: 'Storage & Bandwidth',
        currentPlan: 800,
        odysseyPlan: 600,
        variance: -200,
        status: 'good',
        recommendation: 'Implement CDN, compress assets'
      },
      {
        category: 'Development Tools',
        currentPlan: 1500,
        odysseyPlan: 2200,
        variance: 700,
        status: 'warning',
        recommendation: 'Invest in automation tools for long-term savings'
      },
      {
        category: 'Marketing & Growth',
        currentPlan: 2000,
        odysseyPlan: 1500,
        variance: -500,
        status: 'good',
        recommendation: 'Focus on organic growth, referral programs'
      },
      {
        category: 'Support & Maintenance',
        currentPlan: 1000,
        odysseyPlan: 1200,
        variance: 200,
        status: 'warning',
        recommendation: 'Preventive maintenance reduces long-term costs'
      },
      {
        category: 'Revenue Generation',
        currentPlan: -3000,
        odysseyPlan: -5000,
        variance: -2000,
        status: 'good',
        recommendation: 'Self-sustaining model generates more revenue'
      }
    ];

    setComparisons(budgetData);

    const variance = budgetData.reduce((sum, item) => sum + item.variance, 0);
    setTotalVariance(variance);

    // Calculate sustainability score based on revenue vs costs
    const totalCosts = budgetData.filter(item => item.variance > 0).reduce((sum, item) => sum + Math.abs(item.currentPlan), 0);
    const totalRevenue = Math.abs(budgetData.find(item => item.category === 'Revenue Generation')?.odysseyPlan || 0);
    let score = 0;
    if (totalCosts > 0) {
      score = Math.min(100, (totalRevenue / totalCosts) * 100);
    }
    setSustainabilityScore(score);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Analysis Header */}
      <Card className="border-2 border-red-500 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-800">CRITICAL: Budget vs Self-Sustaining Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${Math.abs(totalVariance).toLocaleString()}
              </div>
              <p className="text-sm text-red-700">
                {totalVariance < 0 ? 'Annual Savings' : 'Additional Investment'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {typeof sustainabilityScore === 'number' && !isNaN(sustainabilityScore) ? sustainabilityScore.toFixed(1) : '0.0'}%
              </div>
              <p className="text-sm text-blue-700">Sustainability Score</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${sustainabilityScore > 80 ? 'text-green-600' : 'text-red-600'}`}>
                {sustainabilityScore > 80 ? 'VIABLE' : 'AT RISK'}
              </div>
              <p className="text-sm text-gray-600">Project Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <div className="grid gap-4">
        {comparisons.map((item, index) => (
          <Card key={index} className={`border-l-4 ${
            item.status === 'critical' ? 'border-l-red-500' :
            item.status === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'
          }`}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{item.category}</h3>
                  <p className="text-sm text-gray-600">{item.recommendation}</p>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.variance < 0 ? 'SAVES' : 'COSTS'} ${Math.abs(item.variance)}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Plan</p>
                  <p className="font-semibold">${item.currentPlan.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">ODYSSEY-1 Plan</p>
                  <p className="font-semibold">${item.odysseyPlan.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Impact</p>
                  <div className="flex items-center gap-1">
                    {item.variance < 0 ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className={item.variance < 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.variance < 0 ? '-' : '+'}${Math.abs(item.variance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Plan */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Survival Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Immediate Actions (Next 30 Days)</h4>
              <ul className="text-sm space-y-1">
                <li>• Implement API call optimization and caching</li>
                <li>• Set up automated cost monitoring alerts</li>
                <li>• Review and optimize database queries</li>
                <li>• Establish revenue generation milestones</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Long-term Strategy (90+ Days)</h4>
              <ul className="text-sm space-y-1">
                <li>• Transition to self-sustaining revenue model</li>
                <li>• Implement automated scaling and cost optimization</li>
                <li>• Build strategic partnerships for cost sharing</li>
                <li>• Develop multiple revenue streams</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => {
                  alert('ODYSSEY-1 Plan implementation initiated! You will receive detailed implementation steps via email.');
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Implement ODYSSEY-1 Plan
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                onClick={() => {
                  alert('Review meeting scheduled for next business day. Calendar invite will be sent shortly.');
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Schedule Review Meeting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}