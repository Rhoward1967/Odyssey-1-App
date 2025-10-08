import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  const [regulatorySimulations, setRegulatorySimulations] = useState<
    RegulatorySimulation[]
  >([]);
  const [economicModels, setEconomicModels] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenarioData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          'advanced-simulation-processor',
          {
            body: { simulationType: 'scenario_planning', parameters: {} },
          }
        );
        if (error) throw error;
        setRegulatorySimulations(data?.regulatorySimulations || []);
        setEconomicModels(data?.economicModels || {});
        setScenarios(data?.scenarios || []);
      } catch (err) {
        setRegulatorySimulations([]);
        setEconomicModels({});
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarioData();
  }, []);

  const generateRecommendation = (type: string): string => {
    const recommendations = {
      what_if: 'Increase bid buffer by 15% to account for risk factors',
      stress_test: 'Diversify supplier base to reduce single points of failure',
      optimization: 'Focus resources on high-probability opportunities',
      regulatory: 'Begin compliance preparation 60 days early',
    };
    return (
      recommendations[type as keyof typeof recommendations] ||
      'Monitor situation closely'
    );
  };

  // Optionally, add functions to trigger new simulations via backend if needed
  // For now, all data is loaded from backend on mount

  if (loading) {
    return (
      <div className='p-8 text-center text-white'>
        Loading scenario planning data...
      </div>
    );
  }
  return (
    <Card className='bg-gradient-to-br from-violet-900 to-purple-900 border-violet-500'>
      <CardHeader>
        <CardTitle className='text-white flex items-center gap-2'>
          🎯 Scenario Planning Engine
          <Badge
            variant='outline'
            className='text-violet-400 border-violet-400'
          >
            {scenarios.filter(s => s.status === 'running').length} Running
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='text-white'>
        <Tabs defaultValue='scenarios' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='scenarios'>Scenarios</TabsTrigger>
            <TabsTrigger value='regulatory'>Regulatory</TabsTrigger>
            <TabsTrigger value='economic'>Economic</TabsTrigger>
          </TabsList>

          <TabsContent value='scenarios' className='space-y-4'>
            <div className='space-y-3'>
              {scenarios.map(scenario => (
                <div key={scenario.id} className='bg-black/20 p-3 rounded-lg'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium'>{scenario.name}</span>
                    <Badge
                      variant={
                        scenario.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {scenario.status}
                    </Badge>
                  </div>
                  <Progress value={scenario.progress} className='mb-2' />
                  {scenario.status === 'completed' && (
                    <div className='text-xs space-y-1 text-gray-300'>
                      <div>
                        Probability:{' '}
                        {(scenario.outcomes.probability * 100).toFixed(1)}%
                      </div>
                      <div>ROI: {scenario.outcomes.roi.toFixed(1)}x</div>
                      <div className='text-violet-300'>
                        {scenario.outcomes.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/*
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-violet-600 hover:bg-violet-700"
                disabled
              >
                What-If Analysis
              </Button>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled
              >
                Stress Test
              </Button>
            </div>
            */}
          </TabsContent>

          <TabsContent value='regulatory' className='space-y-4'>
            {regulatorySimulations.map((sim, index) => (
              <div key={index} className='bg-black/20 p-3 rounded-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium'>{sim.scenario}</span>
                  <Badge
                    variant={
                      sim.riskLevel === 'low' ? 'default' : 'destructive'
                    }
                  >
                    {sim.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className='text-xs space-y-1 text-gray-300'>
                  <div>
                    Compliance:{' '}
                    {(typeof sim.compliance === 'number' &&
                    !isNaN(sim.compliance)
                      ? sim.compliance * 100
                      : 0
                    ).toFixed(1)}
                    %
                  </div>
                  <div>Cost: ${sim.adaptationCost.toLocaleString()}</div>
                  <div>Timeline: {sim.timeToImplement} days</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value='economic' className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-black/20 p-3 rounded-lg'>
                <div className='text-sm font-medium mb-1'>Inflation Impact</div>
                <div className='text-xl font-bold text-red-400'>
                  {(typeof economicModels.inflationImpact === 'number' &&
                  !isNaN(economicModels.inflationImpact)
                    ? economicModels.inflationImpact * 100
                    : 0
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className='bg-black/20 p-3 rounded-lg'>
                <div className='text-sm font-medium mb-1'>
                  Market Volatility
                </div>
                <div className='text-xl font-bold text-orange-400'>
                  {(economicModels.marketVolatility * 100).toFixed(1)}%
                </div>
              </div>
              <div className='bg-black/20 p-3 rounded-lg'>
                <div className='text-sm font-medium mb-1'>Sector Growth</div>
                <div className='text-xl font-bold text-green-400'>
                  {(economicModels.sectorGrowth * 100).toFixed(1)}%
                </div>
              </div>
              <div className='bg-black/20 p-3 rounded-lg'>
                <div className='text-sm font-medium mb-1'>
                  Competition Index
                </div>
                <div className='text-xl font-bold text-blue-400'>
                  {economicModels.competitionIndex.toFixed(2)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
