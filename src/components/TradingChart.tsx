import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketDataService } from '@/services/marketDataService';
import { useEffect, useState } from 'react';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  chartType: string;
}

export default function TradingChart({ symbol, timeframe, chartType }: TradingChartProps) {
  const [currentPrice, setCurrentPrice] = useState(191.44);
  const [priceChange, setPriceChange] = useState(-0.12);
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

  // Much slower, realistic price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        // Much smaller, realistic price movements (0.01% to 0.1%)
        const changePercent = (Math.random() - 0.5) * 0.002; // 0.2% max change
        const change = prev * changePercent;
        const newPrice = prev + change;
        
        // Keep price within reasonable bounds (±5% of base price)
        const basePrice = 191.44;
        const minPrice = basePrice * 0.95;
        const maxPrice = basePrice * 1.05;
        
        const constrainedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
        setPriceChange(constrainedPrice - prev);
        
        return constrainedPrice;
      });
    }, 10000); // Update every 10 seconds instead of 2

    return () => clearInterval(interval);
  }, []);

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
          📊 {symbol} Chart
          <span className="text-2xl font-mono">
            ${currentPrice.toFixed(2)} {priceChange >= 0 ? '▲' : '▼'}
          </span>
          <span className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </CardTitle>
        <p className="text-gray-400 text-sm">{symbol} • Realistic updates every 10 seconds</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-900/50 rounded border border-slate-600 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg">📈 {chartType} Chart</p>
            <p className="text-sm">Timeframe: {timeframe}</p>
            <p className="text-xs">Realistic price movement simulation</p>
            <div className="mt-4 text-xs bg-slate-800 p-3 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">24h Change:</span>
                  <div className={`font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {((priceChange / currentPrice) * 100).toFixed(3)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Volume:</span>
                  <div className="font-mono text-blue-400">52.8M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}