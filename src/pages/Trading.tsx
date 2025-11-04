import TradingAdvisorBot from '@/components/TradingAdvisorBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Trading: React.FC = () => {
  const [tradingMode, setTradingMode] = useState('paper');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [chartTimeframe, setChartTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [realTimePrice, setRealTimePrice] = useState<number>(0);
  const [chartType, setChartType] = useState('line'); // Add chart type state

  // Move marketData outside component or memoize it to fix dependency warnings
  const marketData = React.useMemo(() => ({
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 191.45, change: '+2.34%', volume: '52.8M' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 384.52, change: '+1.23%', volume: '31.2M' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 722.48, change: '+4.67%', volume: '67.1M' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: '-1.45%', volume: '89.3M' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.69, change: '+0.87%', volume: '28.4M' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.32, change: '+1.92%', volume: '45.6M' },
    ],
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: '+3.45%', volume: '$28.4B' },
      { symbol: 'ETH', name: 'Ethereum', price: 2580.75, change: '+2.67%', volume: '$12.8B' },
      { symbol: 'SOL', name: 'Solana', price: 102.34, change: '+5.23%', volume: '$3.2B' },
      { symbol: 'ADA', name: 'Cardano', price: 0.52, change: '+1.89%', volume: '$1.1B' },
      { symbol: 'DOT', name: 'Polkadot', price: 7.85, change: '+4.12%', volume: '$892M' },
      { symbol: 'AVAX', name: 'Avalanche', price: 37.92, change: '+6.78%', volume: '$1.4B' },
    ],
    etfs: [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 477.83, change: '+0.45%', volume: '87.2M' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 388.92, change: '+1.23%', volume: '45.8M' },
      { symbol: 'VTI', name: 'Vanguard Total Stock', price: 238.45, change: '+0.67%', volume: '23.1M' },
      { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 45.67, change: '+2.89%', volume: '12.4M' },
      { symbol: 'TQQQ', name: '3x Nasdaq Bull ETF', price: 63.24, change: '+3.67%', volume: '34.5M' },
      { symbol: 'SQQQ', name: '3x Nasdaq Bear ETF', price: 8.92, change: '-3.45%', volume: '28.9M' },
    ]
  }), []); // Empty dependency array since data is static

  // Memoize generateChartData FIRST (moved up to fix declaration order)
  const generateChartData = React.useCallback((timeframe: string, basePrice: number) => {
    const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
    const data = [];
    let price = basePrice;
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * basePrice * 0.02; // Reduced volatility
      price += variation;
      
      data.push({
        time: timeframe === '1D' 
          ? `${i}:00` 
          : timeframe === '1W' 
            ? `Day ${i + 1}` 
            : `${i + 1}/${new Date().getMonth() + 1}`,
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000000),
        high: Math.round((price + Math.random() * basePrice * 0.01) * 100) / 100,
        low: Math.round((price - Math.random() * basePrice * 0.01) * 100) / 100,
        open: Math.round(price * 100) / 100,
        close: Math.round(price * 100) / 100,
      });
    }
    return data;
  }, []);

  // MetaMask connection
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        
        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const TradingModeSelector = ({ mode, setMode }: { mode: string, setMode: (mode: string) => void }) => (
    <div className="flex gap-4 mb-6">
      <Button 
        variant={mode === 'paper' ? 'default' : 'outline'}
        onClick={() => setMode('paper')}
        className="flex items-center gap-2"
      >
        📚 Paper Trading (Learn)
      </Button>
      <Button 
        variant={mode === 'live' ? 'default' : 'outline'}
        onClick={() => setMode('live')}
        className="flex items-center gap-2"
      >
        💰 Live Trading (Portfolio)
      </Button>
    </div>
  );

  // Real-time price updates (SLOWER and less volatile)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedAsset) {
        const asset = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
          .find(a => a.symbol === selectedAsset);
        
        if (asset) {
          // Much smaller price movement
          const variation = (Math.random() - 0.5) * asset.price * 0.0001; 
          const newPrice = asset.price + variation;
          setRealTimePrice(newPrice);
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  // Initialize chart data when asset changes
  useEffect(() => {
    if (selectedAsset) {
      const asset = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
        .find(a => a.symbol === selectedAsset);
      
      if (asset) {
        setRealTimePrice(asset.price);
        setChartData(generateChartData(chartTimeframe, asset.price));
      }
    }
  }, [selectedAsset, chartTimeframe, marketData, generateChartData]);

  // Remove the duplicate useEffect that was causing the error
  // useEffect(() => {
  //   if (selectedAsset) {
  //     const asset = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
  //       .find(a => a.symbol === selectedAsset);
  //     
  //     if (asset) {
  //       setChartData(generateChartData(chartTimeframe, asset.price));
  //     }
  //   }
  // }, [chartTimeframe, selectedAsset, marketData, generateChartData]);

  const TradingChart = () => {
    const selectedAssetData = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
      .find(a => a.symbol === selectedAsset);

    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                📊 {selectedAsset} Chart
                <span className={`text-sm px-2 py-1 rounded ${
                  realTimePrice > (selectedAssetData?.price || 0) ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  ${realTimePrice.toLocaleString()} {realTimePrice > (selectedAssetData?.price || 0) ? '▲' : '▼'}
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedAssetData?.name} • Real-time updates every 2 seconds
              </CardDescription>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {['1D', '1W', '1M'].map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={chartTimeframe === tf ? 'default' : 'outline'}
                  onClick={() => setChartTimeframe(tf)}
                  className="px-3 py-1"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={chartType} onValueChange={setChartType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line">
              <div className="h-80 w-full sm:h-96"> {/* Taller on larger screens */}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="candlestick">
              <div className="h-80 w-full bg-slate-900/50 rounded flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-xl font-semibold mb-2">Candlestick Chart</div>
                  <div className="text-sm mb-4">Professional OHLC analysis for {selectedAsset}</div>
                  
                  {/* Show actual OHLC data */}
                  <div className="bg-slate-800 p-4 rounded max-w-sm mx-auto">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-green-400 font-semibold">Open</div>
                        <div className="font-mono">${chartData[0]?.open || realTimePrice}</div>
                      </div>
                      <div>
                        <div className="text-red-400 font-semibold">High</div>
                        <div className="font-mono">${Math.max(...chartData.map(d => d.high || realTimePrice))}</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-semibold">Low</div>
                        <div className="font-mono">${Math.min(...chartData.map(d => d.low || realTimePrice))}</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-semibold">Close</div>
                        <div className="font-mono">${chartData[chartData.length - 1]?.close || realTimePrice}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-600">
                      <div className="text-xs text-gray-500">
                        Advanced candlestick charting with technical indicators coming soon
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      onClick={() => setChartType('line')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                    >
                      ← Back to Line Chart
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Trading Panel */}
          <div className="mt-6 p-4 bg-slate-900/50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Stack on mobile */}
              <div>
                <label className="text-sm text-gray-400">Order Type</label>
                <select className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
                  <option>Market Buy</option>
                  <option>Limit Buy</option>
                  <option>Stop Loss</option>
                  <option>Take Profit</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Quantity</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Price (USD)</label>
                <input 
                  type="number" 
                  placeholder={realTimePrice.toString()}
                  className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <Button className="bg-green-600 hover:bg-green-700 flex-1">
                📈 Buy {selectedAsset}
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 flex-1">
                📉 Sell {selectedAsset}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MarketDataTable = ({ assets, title }: { assets: any[], title: string }) => (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto"> {/* Horizontal scroll on small screens */}
          <div className="space-y-2">
            {assets.map((asset) => (
              <div 
                key={asset.symbol} 
                className={`flex justify-between items-center p-3 rounded hover:bg-slate-600/50 cursor-pointer transition-colors ${
                  selectedAsset === asset.symbol ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-slate-700/50'
                }`}
                onClick={() => setSelectedAsset(asset.symbol)}
              >
                <div className="flex-1">
                  <div className="font-semibold text-white">{asset.symbol}</div>
                  <div className="text-sm text-gray-400">{asset.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">${asset.price.toLocaleString()}</div>
                  <div className={`text-sm ${asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.change}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-400">{asset.volume}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PaperTradingMode = () => (
    <div className="space-y-6">
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-300">📚 Paper Trading Simulator</CardTitle>
          <CardDescription className="text-blue-400">
            Learn to trade with virtual money - Practice with real market data!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Virtual Portfolio</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Virtual Cash:</span>
                  <span className="text-green-400 font-mono">$100,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Portfolio Value:</span>
                  <span className="text-blue-400 font-mono">$105,250.75</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total P&L:</span>
                  <span className="text-green-400 font-mono">+$5,250.75 (+5.25%)</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-600">
                  <div className="text-sm text-gray-400">Current Holdings:</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>AAPL (10 shares)</span>
                      <span className="text-green-400">+$125</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BTC (0.5 shares)</span>
                      <span className="text-green-400">+$892</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SPY (15 shares)</span>
                      <span className="text-red-400">-$67</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Learning Progress</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Trades Completed:</span>
                  <span className="text-white">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-green-400">68.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Risk Management:</span>
                  <span className="text-yellow-400">Intermediate</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-600">
                  <div className="text-sm text-gray-400">Asset Classes Traded:</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div>🏢 Stocks: 24 trades</div>
                    <div>₿ Crypto: 15 trades</div>
                    <div>📊 ETFs: 8 trades</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          
          <div className="mt-6 flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              📖 Start New Paper Trade
            </Button>
            <Button variant="outline" className="border-green-500 text-green-400">
              📊 View Learning Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real Market Data for Paper Trading */}
      <div className="grid md:grid-cols-3 gap-6">
        <MarketDataTable assets={marketData.stocks} title="🏢 Stocks" />
        <MarketDataTable assets={marketData.crypto} title="₿ Crypto" />
        <MarketDataTable assets={marketData.etfs} title="📊 ETFs" />
      </div>
    </div>
  );

  const LiveTradingMode = () => (
    <div className="space-y-6">
      {/* MetaMask Connection Card */}
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">🦊 MetaMask Integration</CardTitle>
          <CardDescription className="text-purple-400">
            Connect your wallet for real crypto trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <Button onClick={connectWallet} className="bg-orange-600 hover:bg-orange-700">
              🦊 Connect MetaMask Wallet
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Wallet:</span>
                <span className="text-green-400 font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">ETH Balance:</span>
                <span className="text-blue-400 font-mono">{balance} ETH</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-green-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-300">💰 Live Portfolio Management</CardTitle>
          <CardDescription className="text-green-400">
            Your real trading portfolio - Stocks, Crypto, and ETFs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Total Value</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="text-2xl font-bold text-green-400">$127,892.50</div>
                <div className="text-sm text-gray-400">+$3,150.25 today (+2.5%)</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Stocks</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="text-2xl font-bold text-blue-400">$67,450.00</div>
                <div className="text-sm text-gray-400">AAPL, MSFT, NVDA, TSLA</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Crypto</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="text-2xl font-bold text-purple-400">$43,192.50</div>
                <div className="text-sm text-gray-400">BTC, ETH, SOL, ADA</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">ETFs</h3>
              <div className="bg-slate-800 p-4 rounded space-y-2">
                <div className="text-2xl font-bold text-orange-400">$17,250.00</div>
                <div className="text-sm text-gray-400">SPY, QQQ, VTI, ARKK</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <Button className="bg-green-600 hover:bg-green-700">
              💹 Execute Live Trade
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-400">
              🤖 AI Trade Suggestions
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-400">
              📊 Portfolio Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Market Data */}
      <div className="grid md:grid-cols-3 gap-6">
        <MarketDataTable assets={marketData.stocks} title="🏢 Your Stocks" />
        <MarketDataTable assets={marketData.crypto} title="₿ Your Crypto" />
        <MarketDataTable assets={marketData.etfs} title="📊 Your ETFs" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">📈 AI-Powered Trading Platform</h1>
        <p className="text-gray-400">Learn to trade with paper money or manage your live portfolio</p>
      </div>

      <TradingModeSelector mode={tradingMode} setMode={setTradingMode} />

      {/* Trading Chart - Always visible */}
      <TradingChart />

      {tradingMode === 'paper' && <PaperTradingMode />}
      {tradingMode === 'live' && <LiveTradingMode />}

      {/* AI Trading Advisor (shared between both modes) */}
      <TradingAdvisorBot mode={tradingMode} />
      
      {/* ResearchAIBot moved to Media Center */}
    </div>
  );
};

export default Trading;
