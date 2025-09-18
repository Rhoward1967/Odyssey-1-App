import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface ForecastModel {
  id: string;
  name: string;
  type: 'neural_network' | 'ensemble' | 'transformer' | 'lstm';
  accuracy: number;
  status: 'training' | 'ready' | 'predicting' | 'updating';
  lastTrained: Date;
  predictions: {
    bidSuccess: number;
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    competitorMove: string;
    riskScore: number;
  };
}

interface MarketIntelligence {
  trendAnalysis: {
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    timeframe: string;
  };
  competitorBehavior: {
    aggressiveness: number;
    patternRecognition: string;
    nextMove: string;
  };
  economicFactors: {
    inflation: number;
    gdpGrowth: number;
    sectorHealth: number;
  };
}

export const AIForecastingEngine: React.FC = () => {
  const [models, setModels] = useState<ForecastModel[]>([
    {
      id: 'model_1',
      name: 'Bid Success Predictor',
      type: 'neural_network',
      accuracy: 0.89,
      status: 'ready',
      lastTrained: new Date(Date.now() - 3600000),
      predictions: {
        bidSuccess: 0.73,
        marketTrend: 'bullish',
        competitorMove: 'Price reduction likely',
        riskScore: 0.34
      }
    },
    {
      id: 'model_2',
      name: 'Market Dynamics Analyzer',
      type: 'transformer',
      accuracy: 0.92,
      status: 'predicting',
      lastTrained: new Date(Date.now() - 1800000),
      predictions: {
        bidSuccess: 0.68,
        marketTrend: 'neutral',
        competitorMove: 'Capacity expansion',
        riskScore: 0.42
      }
    }
  ]);

  const [intelligence, setIntelligence] = useState<MarketIntelligence>({
    trendAnalysis: {
      direction: 'up',
      confidence: 0.87,
      timeframe: '3-6 months'
    },
    competitorBehavior: {
      aggressiveness: 0.65,
      patternRecognition: 'Seasonal bidding cycles detected',
      nextMove: 'Technology investment phase'
    },
    economicFactors: {
      inflation: 3.2,
      gdpGrowth: 2.8,
      sectorHealth: 0.78
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setModels(prev => prev.map(model => ({
        ...model,
        accuracy: Math.min(0.99, model.accuracy + (Math.random() - 0.5) * 0.01),
        predictions: {
          ...model.predictions,
          bidSuccess: Math.max(0.1, Math.min(0.95, model.predictions.bidSuccess + (Math.random() - 0.5) * 0.05)),
          riskScore: Math.max(0.1, Math.min(0.9, model.predictions.riskScore + (Math.random() - 0.5) * 0.03))
        }
      })));

      setIntelligence(prev => ({
        ...prev,
        trendAnalysis: {
          ...prev.trendAnalysis,
          confidence: Math.max(0.5, Math.min(0.99, prev.trendAnalysis.confidence + (Math.random() - 0.5) * 0.02))
        },
        competitorBehavior: {
          ...prev.competitorBehavior,
          aggressiveness: Math.max(0.1, Math.min(0.9, prev.competitorBehavior.aggressiveness + (Math.random() - 0.5) * 0.03))
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runPrediction = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'predicting' as const }
        : model
    ));

    setTimeout(() => {
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'ready' as const }
          : model
      ));
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900 to-red-900 border-orange-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🧠 AI Forecasting Engine
          <Badge variant="outline" className="text-orange-400 border-orange-400">
            {models.filter(m => m.status === 'ready').length} Models Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">{((intelligence?.trendAnalysis?.confidence || 0) * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-300">Trend Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{((intelligence?.competitorBehavior?.aggressiveness || 0) * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-300">Competitor Aggression</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{(intelligence?.economicFactors?.sectorHealth || 0).toFixed(2)}</div>
            <div className="text-xs text-gray-300">Sector Health</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-orange-300">Prediction Models</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {models.map((model) => (
              <div key={model.id} className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{model.name}</span>
                  <Badge variant={model.status === 'ready' ? 'default' : 'secondary'}>
                    {model.status}
                  </Badge>
                </div>
                <Progress value={model.accuracy * 100} className="mb-2" />
                <div className="text-xs space-y-1 text-gray-300">
                  <div>Success Rate: {((model?.predictions?.bidSuccess || 0) * 100).toFixed(1)}%</div>
                  <div>Market: {model?.predictions?.marketTrend?.toUpperCase() || 'N/A'}</div>
                  <div>Risk Score: {((model?.predictions?.riskScore || 0) * 100).toFixed(0)}</div>
                </div>
                <Button 
                  size="sm" 
                  className="mt-2 bg-orange-600 hover:bg-orange-700"
                  onClick={() => runPrediction(model.id)}
                  disabled={model.status === 'predicting'}
                >
                  Run Prediction
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-lg">
          <h4 className="font-medium text-orange-300 mb-2">Market Intelligence</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <div>Trend: {intelligence.trendAnalysis.direction.toUpperCase()} ({intelligence.trendAnalysis.timeframe})</div>
            <div>Pattern: {intelligence.competitorBehavior.patternRecognition}</div>
            <div>Next Move: {intelligence.competitorBehavior.nextMove}</div>
            <div>GDP Growth: {intelligence.economicFactors.gdpGrowth}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};