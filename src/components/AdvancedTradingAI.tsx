import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
interface AdvancedTradingAIProps {
  symbol?: string;
  market?: 'crypto' | 'stock';
  portfolio?: any[];
}
export function AdvancedTradingAI({
  symbol = 'BTC',
  market = 'crypto',
  portfolio = []
}: AdvancedTradingAIProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [signals, setSignals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const getAnalysis = async (action: string, data: any) => {
    setLoading(true);
    try {
      const {
        data: result
      } = await supabase.functions.invoke('ai-trading-advisor', {
        body: {
          action,
          data
        }
      });
      return result;
    } catch (error) {
      console.error('AI Analysis Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const performTechnicalAnalysis = async () => {
    const result = await getAnalysis('technical_analysis', {
      symbol,
      timeframe: '1h'
    });
    setAnalysis(result);
  };
  const getTradingSignals = async () => {
    const result = await getAnalysis('get_trading_signals', {
      symbol,
      market
    });
    setSignals(result);
  };
  const analyzePortfolio = async () => {
    const result = await getAnalysis('analyze_portfolio', {
      holdings: portfolio,
      totalValue: 10000
    });
    setAnalysis(result);
  };
  useEffect(() => {
    performTechnicalAnalysis();
    getTradingSignals();
  }, [symbol, market]);
  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Trading Analysis
            <Badge variant={signals?.signals?.recommendation === 'BUY' ? 'default' : 'secondary'}>
              {signals?.signals?.recommendation || 'ANALYZING'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis && <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">RSI</h4>
                <p className="text-sm text-muted-foreground">
                  {analysis.indicators?.rsi?.value?.toFixed(2)} - {analysis.indicators?.rsi?.signal}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">MACD</h4>
                <p className="text-sm text-muted-foreground">
                  {analysis.indicators?.macd?.signal}
                </p>
              </div>
            </div>}
          
          <div className="flex gap-2">
            <Button onClick={performTechnicalAnalysis} disabled={loading} size="sm">TA</Button>
            <Button onClick={getTradingSignals} disabled={loading} size="sm"> Signals</Button>
            <Button onClick={analyzePortfolio} disabled={loading} size="sm"> Analysis</Button>
          </div>

          {signals && <div className="mt-4 p-3 bg-muted rounded">
              <h4 className="font-semibold mb-2">Trading Signals</h4>
              <p className="text-sm">Confidence: {signals.signals?.confidence?.toFixed(1)}%</p>
              <p className="text-sm">Trend: {signals.signals?.technical?.trend}</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
}