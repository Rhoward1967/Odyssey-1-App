import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Trade {
  id: string;
  symbol: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  status: string;
  timestamp: string;
}

interface Portfolio {
  symbol: string;
  balance: number;
  value: number;
  change: number;
}

export const LiveTradingDashboard = () => {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPortfolio();
    loadTrades();
  }, []);

  const loadPortfolio = async () => {
    try {
      // Query Supabase for live portfolio data
      const { data, error } = await supabase
        .from('user_portfolio')
        .select('*');
      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setPortfolio([]);
    }
  };

  const loadTrades = async () => {
    try {
      // Query Supabase for live trade history
      const { data, error } = await supabase
        .from('trade_history')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Failed to load trades:', error);
      setTrades([]);
    }
  };

  const executeTrade = async (type: 'buy' | 'sell') => {
    if (!tradeAmount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('uphold-trading-engine', {
        body: {
          action: 'executeTrade',
          symbol: selectedAsset,
          amount: parseFloat(tradeAmount),
          orderType: type
        }
      });

      if (error) throw error;

      const newTrade: Trade = {
        id: data.orderId,
        symbol: selectedAsset,
        amount: parseFloat(tradeAmount),
        price: data.price,
        type,
        status: data.status,
        timestamp: data.timestamp
      };

      setTrades(prev => [newTrade, ...prev]);
      setTradeAmount('');
    } catch (error) {
      console.error('Trade execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Live Trading Dashboard</h2>
        <Badge variant={isDemo ? "secondary" : "default"}>
          {isDemo ? "Demo Mode" : "Live Trading"}
        </Badge>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {portfolio.map((asset) => (
          <Card key={asset.symbol}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{asset.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asset.balance}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                ${asset.value.toLocaleString()}
                <div className={`ml-2 flex items-center ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(asset.change)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Execute Trade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Asset</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="LTC">Litecoin (LTC)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button 
                onClick={() => executeTrade('buy')}
                disabled={loading || !tradeAmount}
                className="bg-green-600 hover:bg-green-700"
              >
                Buy
              </Button>
              <Button 
                onClick={() => executeTrade('sell')}
                disabled={loading || !tradeAmount}
                variant="destructive"
              >
                Sell
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                    {trade.type.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{trade.symbol}</span>
                  <span>{trade.amount}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${trade.price.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{trade.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};