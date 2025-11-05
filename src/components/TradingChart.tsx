import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketDataService } from '@/services/marketDataService';
import { useEffect, useState } from 'react';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  chartType: string;
}

export default function TradingChart({ symbol, timeframe, chartType }: TradingChartProps) {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real market data
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      
      // Get real current price
      const realPrice = await MarketDataService.getRealStockPrice(symbol);
      if (realPrice) {
        setCurrentPrice(realPrice.price);
        setPriceChange(realPrice.change);
      }

      // Get real historical data
      const historical = await MarketDataService.getHistoricalData(symbol, timeframe);
      setHistoricalData(historical);
      
      setLoading(false);
    };

    fetchRealData();
  }, [symbol, timeframe]);

  // Real-time price updates every 30 seconds (API limits)
  useEffect(() => {
    const interval = setInterval(async () => {
      const realPrice = await MarketDataService.getRealStockPrice(symbol);
      if (realPrice) {
        setCurrentPrice(realPrice.price);
        setPriceChange(realPrice.change);
      }
    }, 30000); // 30 seconds to respect API limits

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading real market data for {symbol}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          📊 {symbol} Chart - LIVE DATA
          <span className="text-2xl font-mono">
            ${currentPrice.toFixed(2)} {priceChange >= 0 ? '▲' : '▼'}
          </span>
          <span className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-900/50 rounded border border-slate-600">
          {historicalData.length > 0 ? (
            <div className="p-4">
              <p className="text-green-400 text-sm mb-2">✅ Real Market Data Active</p>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Open:</span>
                  <div className="font-mono text-white">${historicalData[0]?.open?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">High:</span>
                  <div className="font-mono text-green-400">${Math.max(...historicalData.map(d => d.high))?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Low:</span>
                  <div className="font-mono text-red-400">${Math.min(...historicalData.map(d => d.low))?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Volume:</span>
                  <div className="font-mono text-blue-400">{historicalData[0]?.volume?.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                📡 Data from Alpha Vantage API • Updates every 30 seconds
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Real chart rendering with {historicalData.length} data points</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}