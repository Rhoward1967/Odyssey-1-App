import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MarketInsight {
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  message: string;
  timestamp: string;
}

interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  asset: string;
  price: number;
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
}

const TradingAdvisor: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInitialInsights();
    generateTradingSignals();
  }, []);

  const generateInitialInsights = () => {
    const mockInsights: MarketInsight[] = [
      {
        type: 'bullish',
        confidence: 78,
        message: 'Bitcoin showing strong support at $42,000. Technical indicators suggest potential breakout above $45,000.',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        type: 'bearish',
        confidence: 65,
        message: 'Ethereum facing resistance at $2,800. Consider taking profits if holding long positions.',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        type: 'neutral',
        confidence: 82,
        message: 'Market volatility expected due to upcoming Fed announcement. Maintain balanced portfolio.',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    setInsights(mockInsights);
  };

  const generateTradingSignals = () => {
    const mockSignals: TradingSignal[] = [
      {
        action: 'buy',
        asset: 'BTC-USD',
        price: 43287,
        reasoning: 'RSI oversold, MACD bullish crossover, strong volume support',
        risk_level: 'medium'
      },
      {
        action: 'hold',
        asset: 'ETH-USD',
        price: 2750,
        reasoning: 'Consolidating near resistance, wait for clear breakout signal',
        risk_level: 'low'
      }
    ];
    setSignals(mockSignals);
  };

  const handleAIQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trading-advisor', {
        body: { 
          query: query.trim(),
          market_data: {
            btc_price: '43287',
            btc_dominance: '52'
          }
        }
      });

      if (error) throw error;
      
      setResponse(data.response);
    } catch (error) {
      console.error('AI Advisor Error:', error);
      setResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-600';
      case 'sell': return 'bg-red-600';
      default: return 'bg-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">AI Trading Advisor</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Real-time Analysis
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {insight.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs opacity-70">{insight.confidence}% confidence</span>
                </div>
                <p className="text-sm">{insight.message}</p>
                <p className="text-xs opacity-60 mt-1">{insight.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trading Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.map((signal, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-white ${getSignalColor(signal.action)}`}>
                      {signal.action.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{signal.asset}</span>
                  </div>
                  <span className="text-lg font-bold">${signal.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{signal.reasoning}</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs">Risk: {signal.risk_level}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ask Your AI Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask me about market conditions, trading strategies, risk management..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleAIQuery} disabled={loading || !query.trim()}>
            {loading ? 'Analyzing...' : 'Get AI Advice'}
          </Button>
          {response && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm">{response}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingAdvisor;