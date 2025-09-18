import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Server, Users, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScalingPrediction {
  subscribers: number;
  monthlyCost: number;
  costPerUser: number;
  infrastructureNeeds: string[];
  recommendations: string[];
  breakEvenPoint: number;
}

export default function ScalingPredictor() {
  const [currentSubs, setCurrentSubs] = useState(1250);
  const [projectedSubs, setProjectedSubs] = useState(5000);
  const [currentCost, setCurrentCost] = useState(8200);
  const [prediction, setPrediction] = useState<ScalingPrediction | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    calculateScaling();
  }, [currentSubs, projectedSubs, currentCost]);

  const calculateScaling = () => {
    const growthFactor = projectedSubs / currentSubs;
    const baseCostPerUser = currentCost / currentSubs;
    
    // Infrastructure scaling (economies of scale)
    const scalingEfficiency = Math.max(0.7, 1 - (growthFactor - 1) * 0.1);
    const projectedCostPerUser = baseCostPerUser * scalingEfficiency;
    const projectedMonthlyCost = projectedCostPerUser * projectedSubs;

    const infrastructureNeeds = [];
    const recommendations = [];

    if (projectedSubs > 2000) {
      infrastructureNeeds.push('Load balancer upgrade');
      infrastructureNeeds.push('Database scaling');
    }
    if (projectedSubs > 5000) {
      infrastructureNeeds.push('CDN implementation');
      infrastructureNeeds.push('Microservices architecture');
    }
    if (projectedSubs > 10000) {
      infrastructureNeeds.push('Multi-region deployment');
      infrastructureNeeds.push('Advanced caching layer');
    }

    if (projectedCostPerUser > 0.10) {
      recommendations.push('Optimize API usage to reduce per-user costs');
    }
    if (growthFactor > 3) {
      recommendations.push('Consider bulk pricing negotiations with vendors');
    }
    if (projectedMonthlyCost > 20000) {
      recommendations.push('Implement cost monitoring alerts');
      recommendations.push('Consider reserved instance pricing');
    }

    // Break-even calculation (assuming $10/month subscription)
    const revenuePerUser = 10;
    const breakEvenPoint = Math.ceil(projectedMonthlyCost / revenuePerUser);

    setPrediction({
      subscribers: projectedSubs,
      monthlyCost: projectedMonthlyCost,
      costPerUser: projectedCostPerUser,
      infrastructureNeeds,
      recommendations,
      breakEvenPoint
    });

    // Generate chart data
    const data = [];
    for (let i = currentSubs; i <= projectedSubs; i += Math.ceil((projectedSubs - currentSubs) / 10)) {
      const factor = i / currentSubs;
      const efficiency = Math.max(0.7, 1 - (factor - 1) * 0.1);
      const cost = baseCostPerUser * efficiency * i;
      const revenue = i * revenuePerUser;
      
      data.push({
        subscribers: i,
        cost: cost,
        revenue: revenue,
        profit: revenue - cost
      });
    }
    setChartData(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Scaling Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current-subs">Current Subscribers</Label>
              <Input
                id="current-subs"
                type="number"
                value={currentSubs}
                onChange={(e) => setCurrentSubs(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="projected-subs">Projected Subscribers</Label>
              <Input
                id="projected-subs"
                type="number"
                value={projectedSubs}
                onChange={(e) => setProjectedSubs(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="current-cost">Current Monthly Cost ($)</Label>
              <Input
                id="current-cost"
                type="number"
                value={currentCost}
                onChange={(e) => setCurrentCost(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projected Cost</p>
                    <p className="text-2xl font-bold">${prediction.monthlyCost.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost per User</p>
                    <p className="text-2xl font-bold">${prediction.costPerUser.toFixed(4)}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Break-even</p>
                    <p className="text-2xl font-bold">{prediction.breakEvenPoint.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold">
                      {(((10 - prediction.costPerUser) / 10) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Server className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost vs Revenue Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subscribers" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {prediction.infrastructureNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Infrastructure Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {prediction.infrastructureNeeds.map((need, index) => (
                    <Badge key={index} variant="secondary">{need}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {prediction.recommendations.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Scaling Recommendations:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}