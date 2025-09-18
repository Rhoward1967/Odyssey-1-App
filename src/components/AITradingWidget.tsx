import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIInsight {
  type: 'bullish' | 'bearish' | 'neutral' | 'warning';
  message: string;
  confidence: number;
  action?: string;
}

interface AITradingWidgetProps {
  symbol?: string;
  context?: 'portfolio' | 'trade' | 'market' | 'orders';
  data?: any;
}

const AITradingWidget: React.FC<AITradingWidgetProps> = ({ 
  symbol = 'BTC-USD', 
  context = 'market',
  data 
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateContextualInsights();
  }, [symbol, context, data]);

  const generateContextualInsights = async () => {
    setLoading(true);
    try {
      // Mock insights for demo - replace with real API when available
      const mockInsights: AIInsight[] = [
        {
          type: 'bullish',
          message: `${symbol} showing strong upward momentum`,
          confidence: 85,
          action: 'Consider increasing position size'
        },
        {
          type: 'neutral',
          message: 'Market volatility within normal range',
          confidence: 72,
          action: 'Monitor for breakout signals'
        }
      ];
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('AI insights error:', error);
      // Fallback to mock data
      setInsights([{
        type: 'neutral',
        message: 'AI analysis temporarily unavailable',
        confidence: 50,
        action: 'Using cached market data'
      }]);
    }
    setLoading(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-green-50 border-green-200 text-green-800';
      case 'bearish': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-sm text-purple-700">AI analyzing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Bot className="w-4 h-4 mr-2 text-purple-600" />
          AI Trading Assistant
          <Badge variant="outline" className="ml-2 text-xs">
            {context.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
            <div className="flex items-start space-x-2">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.action && (
                  <p className="text-xs mt-1 opacity-80">{insight.action}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-xs">Confidence: {insight.confidence}%</span>
                  <div className="ml-2 flex-1 bg-white bg-opacity-50 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-current opacity-60"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateContextualInsights}
          className="w-full mt-3 bg-white hover:bg-purple-50"
        >
          <Bot className="w-4 h-4 mr-2" />
          Refresh AI Insights
        </Button>
      </CardContent>
    </Card>
  );
};

export { AITradingWidget };
export default AITradingWidget;