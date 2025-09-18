import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/lib/supabase';

interface AIAnalysisItem {
  id: string;
  symbol: string;
  analysis_type: string;
  result: {
    recommendation: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    target_price?: number;
  };
  confidence_score: number;
  created_at: string;
}

interface RealtimeAIAnalysisProps {
  symbol?: string;
  analysisTypes?: string[];
}

export function RealtimeAIAnalysis({ 
  symbol = 'BTC',
  analysisTypes = ['technical', 'sentiment', 'fundamental']
}: RealtimeAIAnalysisProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const { syncData } = useOfflineSync();
  
  const { 
    data: analysisData, 
    loading, 
    connected, 
    lastUpdate 
  } = useRealtimeData<AIAnalysisItem>('ai_analysis', { 
    column: 'symbol', 
    value: symbol 
  });

  const runAnalysis = async (type: string) => {
    setActiveAnalysis(type);
    
    try {
      // Simulate AI analysis
      const mockAnalysis = {
        symbol,
        analysis_type: type,
        result: {
          recommendation: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)] as 'BUY' | 'SELL' | 'HOLD',
          confidence: Math.random() * 100,
          reasoning: `${type} analysis suggests market conditions are favorable based on current indicators.`,
          risk_level: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH',
          target_price: Math.random() * 50000 + 20000
        },
        confidence_score: Math.random() * 0.4 + 0.6,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      await syncData('ai_analysis', 'INSERT', mockAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setActiveAnalysis(null);
    }
  };

  const getLatestAnalysis = (type: string) => {
    return analysisData
      .filter(item => item.analysis_type === type)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Real-time AI Analysis - {symbol}
          {connected && <Badge variant="outline" className="ml-2">Live</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisTypes.map(type => {
            const analysis = getLatestAnalysis(type);
            const isRunning = activeAnalysis === type;
            
            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium capitalize">{type} Analysis</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runAnalysis(type)}
                    disabled={isRunning || loading}
                  >
                    {isRunning ? 'Running...' : 'Analyze'}
                  </Button>
                </div>

                {analysis ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getRecommendationColor(analysis.result.recommendation)}>
                        {analysis.result.recommendation}
                      </Badge>
                      <span className={`text-sm ${getRiskColor(analysis.result.risk_level)}`}>
                        {analysis.result.risk_level} Risk
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confidence</span>
                        <span>{Math.round(analysis.result.confidence)}%</span>
                      </div>
                      <Progress value={analysis.result.confidence} className="h-2" />
                    </div>

                    {analysis.result.target_price && (
                      <div className="text-sm">
                        <span className="text-gray-600">Target: </span>
                        <span className="font-medium">
                          ${analysis.result.target_price.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600">
                      {analysis.result.reasoning}
                    </p>

                    <div className="text-xs text-gray-500">
                      {new Date(analysis.created_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No analysis available</p>
                  </div>
                )}

                {isRunning && (
                  <div className="mt-3">
                    <Progress value={50} className="h-2" />
                    <p className="text-sm text-gray-600 mt-1">
                      Running {type} analysis...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {lastUpdate && (
          <div className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}