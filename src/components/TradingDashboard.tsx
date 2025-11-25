import { RobustTradingControls } from '@/components/RobustTradingControls';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFunding } from '@/contexts/FundingContext';
import { AggregatedPosition, usePositionLots } from '@/contexts/PositionLotsProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle,
  Bot,
  Cpu,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface LivePosition extends AggregatedPosition {
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

interface AIAdvice {
  source: string;
  analysis: string;
  symbol?: string; 
  news_analyzed?: { title: string, description: string }[];
}

interface Trade {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

const TradingDashboard: React.FC = () => {
  const { toast } = useToast();
  const { balance, adjustBalance } = useFunding();
  const { addPositionLot, getAggregatedPositions } = usePositionLots(); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trading, setTrading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [livePositions, setLivePositions] = useState<LivePosition[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  const [aiSignals, setAiSignals] = useState<AIAdvice[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);

  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const fetchLivePortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('trade-orchestrator', {
        body: { action: 'GET_LIVE_P_AND_L' }
      });

      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      const positions = data.positions.map((p: any) => ({
        ...p,
        averageCost: p.avgCost,
        totalShares: p.totalShares,
        pnlPercent: p.totalCost > 0 ? (p.pnl / p.totalCost) * 100 : 0
      }));

      setLivePositions(positions || []);
      setPortfolioValue(data.totalValue || 0);
      setTotalPnl(data.pnl || 0);
      setTotalCost(data.totalCost || 0);

    } catch (err: any) {
      setError(`Failed to load portfolio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAIAnalysis = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('trade-orchestrator', {
        body: { action: 'GET_AI_ADVICE', payload: { symbol } }
      });
      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);
      
      setAiSignals(prev => [{...data, symbol}, ...prev].slice(0, 5));
      toast({ title: `AI Analysis for ${symbol} Complete`, description: "Check the AI Signals tab."});
    } catch (err: any) {
      setError(`Failed to get AI analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const executePaperTrade = async () => {
    if (!selectedAsset || !quantity || trading) return;
    const tradeQuantity = parseFloat(quantity);
    const tradePrice = orderType === 'limit' ? parseFloat(price) || 0 : 0; 
    if (tradeQuantity <= 0) return;
    if (orderType === 'limit' && tradePrice <= 0) return;

    setTrading(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('trade-orchestrator', {
        body: { 
          action: 'EXECUTE_PAPER_TRADE',
          payload: {
            symbol: selectedAsset,
            side: orderSide,
            quantity: tradeQuantity,
            price: tradePrice,
          }
        }
      });
      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      addPositionLot(selectedAsset, orderSide === 'buy' ? tradeQuantity : -tradeQuantity, data.trade.price, `Paper Trade ${orderSide}`);
      
      adjustBalance(orderSide === 'buy' ? -data.trade.value : data.trade.value);
      await fetchLivePortfolioData(); 
      setQuantity('');
      setPrice('');
      toast({ title: `✅ Paper Trade Executed`, description: `${orderSide.toUpperCase()} ${tradeQuantity} ${selectedAsset} @ $${data.trade.price}` });
      
      const newTrade: Trade = {
        id: data.trade.id,
        symbol: data.trade.symbol,
        action: data.trade.type as 'buy' | 'sell',
        quantity: data.trade.quantity,
        price: data.trade.price,
        total: data.trade.value,
        timestamp: data.trade.timestamp,
        status: 'EXECUTED'
      };
      setOrders(prev => [newTrade, ...prev]);

    } catch (error: any) {
      setError(`Trade Execution Failed: ${error.message}`);
      toast({ title: 'Trade Failed', description: error.message, variant: 'destructive'});
    } finally {
      setTrading(false);
    }
  };

  useEffect(() => {
    fetchLivePortfolioData();
  }, [fetchLivePortfolioData]);

  const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const getChangeColor = (value: number) => value >= 0 ? 'text-green-400' : 'text-red-400';

  if (loading && livePositions.length === 0 && !error) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center text-white">
          <Cpu className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Initializing Trading Engine</h2>
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const totalValue = balance + portfolioValue;
  const totalPLPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Trading Cockpit
            </h1>
            <p className="text-gray-400 text-sm">Institutional-Grade Paper Trading Platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchLivePortfolioData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totalPnl >= 0 ? 'from-green-900 to-green-800 border-green-700' : 'from-red-900 to-red-800 border-red-700'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${totalPnl >= 0 ? 'text-green-100' : 'text-red-100'}`}>Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalPnl)}</div>
            <p className={`text-sm ${getChangeColor(totalPnl)}`}>{formatPercent(totalPLPercent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <Tabs defaultValue="trading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="trading" className="data-[state=active]:bg-blue-600">Trade</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-blue-600">Positions</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">AI Signals</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Execute Trade</CardTitle>
              <CardDescription className="text-gray-400">Paper trading with real market data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="symbol" className="text-white">Symbol</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AAPL">AAPL</SelectItem>
                      <SelectItem value="GOOGL">GOOGL</SelectItem>
                      <SelectItem value="MSFT">MSFT</SelectItem>
                      <SelectItem value="AMZN">AMZN</SelectItem>
                      <SelectItem value="TSLA">TSLA</SelectItem>
                      <SelectItem value="NVDA">NVDA</SelectItem>
                      <SelectItem value="META">META</SelectItem>
                      <SelectItem value="SPY">SPY</SelectItem>
                      <SelectItem value="QQQ">QQQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="side" className="text-white">Side</Label>
                  <Select value={orderSide} onValueChange={(value: 'buy' | 'sell') => setOrderSide(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-white">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="orderType" className="text-white">Order Type</Label>
                  <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {orderType === 'limit' && (
                <div>
                  <Label htmlFor="price" className="text-white">Limit Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0.00"
                  />
              </div>
            )}

              <div className="flex space-x-4">
                <RobustTradingControls
                  selectedAsset={selectedAsset}
                  quantity={quantity}
                  orderSide={orderSide}
                  onTradeComplete={fetchLivePortfolioData}
                />
                
                <Button 
                  onClick={() => getAIAnalysis(selectedAsset)}
                  variant="outline"
                  disabled={loading}
                  className="border-purple-600 text-purple-400 hover:bg-purple-600"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Live Portfolio Holdings</CardTitle>
              <CardDescription className="text-gray-400">Real-time P&L based on live market data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {livePositions.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No positions held.</p>
                ) : (
                  <div className="space-y-3">
                    {livePositions.map((pos) => (
                      <div key={pos.symbol} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-white">{pos.symbol}</h3>
                          <div className={`text-lg font-bold ${getChangeColor(pos.pnl)}`}>
                            {formatCurrency(pos.pnl)} ({formatPercent(pos.pnlPercent)})
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Total Value</p>
                            <p className="font-medium text-white">{formatCurrency(pos.currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Shares</p>
                            <p className="font-medium text-white">{pos.totalShares.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Avg. Cost</p>
                            <p className="font-medium text-white">{formatCurrency(pos.averageCost)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Live Price</p>
                            <p className="font-medium text-white">{formatCurrency(pos.currentPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Analysis Archive</CardTitle>
              <CardDescription className="text-gray-400">Educational market analysis from our AI engine</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] p-4 bg-gray-900 rounded-lg border border-gray-700">
                {aiSignals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10">No AI signals generated yet.</p>
                ) : (
                  aiSignals.map((signal, i) => (
                    <div key={i} className="mb-4 pb-4 border-b border-gray-700">
                      <p className="text-sm font-medium text-cyan-400">
                        {signal.source} Analysis for {signal.symbol || 'N/A'}:
                      </p>
                      <p className="text-sm whitespace-pre-wrap text-gray-300 mt-2">
                        {signal.analysis}
                      </p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order History</CardTitle>
              <CardDescription className="text-gray-400">Recent trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No orders executed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">
                              {order.action.toUpperCase()} {order.quantity} {order.symbol}
                            </p>
                            <p className="text-sm text-gray-400">
                              @ {formatCurrency(order.price)} • Total: {formatCurrency(order.total)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={order.status === 'EXECUTED' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(order.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;