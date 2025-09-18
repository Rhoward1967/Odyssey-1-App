import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { RealtimeConnectionStatus } from './RealtimeConnectionStatus';
import { supabase } from '@/lib/supabase';

interface TradingDataItem {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  change_24h: number;
  timestamp: string;
  market_type: string;
}

interface RealtimeTradingDataProps {
  symbols?: string[];
  autoRefresh?: boolean;
}

export function RealtimeTradingData({ 
  symbols = ['BTC', 'ETH', 'SOL', 'ADA'], 
  autoRefresh = true 
}: RealtimeTradingDataProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const { syncData } = useOfflineSync();
  
  const { 
    data: tradingData, 
    loading, 
    error, 
    connected, 
    lastUpdate, 
    refresh 
  } = useRealtimeData<TradingDataItem>('trading_data');

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      const mockData = {
        symbol: selectedSymbol,
        price: Math.random() * 50000 + 20000,
        volume: Math.random() * 1000000,
        change_24h: (Math.random() - 0.5) * 10,
        market_type: 'crypto',
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      await syncData('trading_data', 'INSERT', mockData);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol, autoRefresh, syncData]);

  const getLatestPrice = (symbol: string) => {
    const symbolData = tradingData
      .filter(item => item.symbol === symbol)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return symbolData[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {Math.abs(change).toFixed(2)}%
      </div>
    );
  };

  if (loading && tradingData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading trading data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <RealtimeConnectionStatus 
        connected={connected} 
        lastUpdate={lastUpdate}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-time Trading Data
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {symbols.map(symbol => {
              const data = getLatestPrice(symbol);
              return (
                <div 
                  key={symbol}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedSymbol === symbol ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{symbol}</Badge>
                    {data && formatChange(data.change_24h)}
                  </div>
                  
                  <div className="text-2xl font-bold">
                    {data ? formatPrice(data.price) : '--'}
                  </div>
                  
                  {data && (
                    <div className="text-sm text-gray-500 mt-1">
                      Vol: {data.volume.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}