import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Scenario {
  id: string;
  name: string;
  type: 'what_if' | 'stress_test' | 'optimization' | 'regulatory';
  status: 'running' | 'completed' | 'failed';
  progress: number;
  variables: Record<string, number>;
  outcomes: {
    probability: number;
    impact: number;
    recommendation: string;
    roi: number;
  };
}

interface RegulatorySimulation {
  scenario: string;
  compliance: number;
  adaptationCost: number;
  timeToImplement: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export const ScenarioPlanningEngine: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [regulatorySimulations, setRegulatorySimulations] = useState<RegulatorySimulation[]>([
    {
      scenario: 'New Procurement Regulations',
      compliance: 0.87,
      adaptationCost: 45000,
      timeToImplement: 90,
      riskLevel: 'medium'
    },
    {
      scenario: 'Environmental Standards Update',
      compliance: 0.92,
      adaptationCost: 23000,
      timeToImplement: 45,
      riskLevel: 'low'
    }
  ]);

  const [economicModels, setEconomicModels] = useState({
    inflationImpact: 0.032,
    marketVolatility: 0.18,
    sectorGrowth: 0.067,
    competitionIndex: 0.74
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setScenarios(prev => prev.map(scenario => {
        if (scenario.status === 'running' && scenario.progress < 100) {
          const newProgress = Math.min(100, scenario.progress + Math.random() * 20);
          const isComplete = newProgress >= 100;
          
          return {
            ...scenario,
            progress: newProgress,
            status: isComplete ? 'completed' : 'running',
            outcomes: isComplete ? {
              probability: 0.6 + Math.random() * 0.35,
              impact: Math.random() * 100,
              recommendation: generateRecommendation(scenario.type),
              roi: 1.2 + Math.random() * 2.8
            } : scenario.outcomes
          };
        }
        return scenario;
      }));

      setEconomicModels(prev => ({
        ...prev,
        marketVolatility: Math.max(0.05, Math.min(0.4, prev.marketVolatility + (Math.random() - 0.5) * 0.02))
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const generateRecommendation = (type: string): string => {
    const recommendations = {
      what_if: 'Increase bid buffer by 15% to account for risk factors',
      stress_test: 'Diversify supplier base to reduce single points of failure',
      optimization: 'Focus resources on high-probability opportunities',
      regulatory: 'Begin compliance preparation 60 days early'
    };
    return recommendations[type as keyof typeof recommendations] || 'Monitor situation closely';
  };

  const runWhatIfAnalysis = () => {
    const newScenario: Scenario = {
      id: `whatif_${Date.now()}`,
      name: 'Price Increase Scenario',
      type: 'what_if',
      status: 'running',
      progress: 0,
      variables: {
        priceIncrease: 0.15,
        demandElasticity: -0.8,
        competitorResponse: 0.6
      },
      outcomes: {
        probability: 0,
        impact: 0,
        recommendation: '',
        roi: 0
      }
    };
    
    setScenarios(prev => [...prev, newScenario]);
  };

  const runStressTest = () => {
    const newScenario: Scenario = {
      id: `stress_${Date.now()}`,
      name: 'Supply Chain Disruption',
      type: 'stress_test',
      status: 'running',
      progress: 0,
      variables: {
        supplyReduction: 0.4,
        costIncrease: 0.25,
        deliveryDelay: 30
      },
      outcomes: {
        probability: 0,
        impact: 0,
        recommendation: '',
        roi: 0
      }
    };
    
    setScenarios(prev => [...prev, newScenario]);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-900 to-purple-900 border-violet-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🎯 Scenario Planning Engine
          <Badge variant="outline" className="text-violet-400 border-violet-400">
            {scenarios.filter(s => s.status === 'running').length} Running
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios" className="space-y-4">
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="bg-black/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{scenario.name}</span>
                    <Badge variant={scenario.status === 'completed' ? 'default' : 'secondary'}>
                      {scenario.status}
                    </Badge>
                  </div>
                  <Progress value={scenario.progress} className="mb-2" />
                  {scenario.status === 'completed' && (
                    <div className="text-xs space-y-1 text-gray-300">
                      <div>Probability: {(scenario.outcomes.probability * 100).toFixed(1)}%</div>
                      <div>ROI: {scenario.outcomes.roi.toFixed(1)}x</div>
                      <div className="text-violet-300">{scenario.outcomes.recommendation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-violet-600 hover:bg-violet-700"
                onClick={runWhatIfAnalysis}
              >
                What-If Analysis
              </Button>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={runStressTest}
              >
                Stress Test
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="regulatory" className="space-y-4">
            {regulatorySimulations.map((sim, index) => (
              <div key={index} className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{sim.scenario}</span>
                  <Badge variant={sim.riskLevel === 'low' ? 'default' : 'destructive'}>
                    {sim.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs space-y-1 text-gray-300">
                  <div>Compliance: {(sim.compliance * 100).toFixed(1)}%</div>
                  <div>Cost: ${sim.adaptationCost.toLocaleString()}</div>
                  <div>Timeline: {sim.timeToImplement} days</div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="economic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Inflation Impact</div>
                <div className="text-xl font-bold text-red-400">{(economicModels.inflationImpact * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Market Volatility</div>
                <div className="text-xl font-bold text-orange-400">{(economicModels.marketVolatility * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Sector Growth</div>
                <div className="text-xl font-bold text-green-400">{(economicModels.sectorGrowth * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Competition Index</div>
                <div className="text-xl font-bold text-blue-400">{economicModels.competitionIndex.toFixed(2)}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};