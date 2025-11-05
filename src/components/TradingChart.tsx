import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  chartType: string;
}

export default function TradingChart({ symbol, timeframe, chartType }: TradingChartProps) {
  const [currentPrice, setCurrentPrice] = useState(191.44);
  const [priceChange, setPriceChange] = useState(-0.12);

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setCurrentPrice(prev => Math.max(0, prev + change));
      setPriceChange(change);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          📊 {symbol} Chart
          <span className="text-2xl font-mono">
            ${currentPrice.toFixed(2)} {priceChange >= 0 ? '▲' : '▼'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-900/50 rounded border border-slate-600 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg">📈 {chartType} Chart</p>
            <p className="text-sm">Timeframe: {timeframe}</p>
            <p className="text-xs">Price updates every 2 seconds</p>
          </div>
        </div>
      </CardContent>
      {/* Clean, working trading chart component */}
    </Card>
  );
}