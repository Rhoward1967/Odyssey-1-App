// AI Trading API integration
async function submitAITrade({ symbol, side, amount, price, orderType, meta }) {
  try {
    const res = await fetch('/api/aiTrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, side, amount, price, orderType, meta })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message || err };
  }
}

// Admin review UI for AI trade logs (scaffold)
const AITradeLogAdmin: React.FC = () => {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch('/api/aiTradeLog');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch {}
      setLoading(false);
    }
    fetchLogs();
  }, []);
  return (
    <div className="my-8">
      <h2 className="text-lg font-bold mb-2">AI Trade Log (Admin)</h2>
      {loading ? <div>Loading...</div> : (
        <div className="overflow-x-auto max-h-64 border rounded bg-white">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1">Time</th>
                <th className="px-2 py-1">Symbol</th>
                <th className="px-2 py-1">Side</th>
                <th className="px-2 py-1">Amount</th>
                <th className="px-2 py-1">Price</th>
                <th className="px-2 py-1">OrderType</th>
                <th className="px-2 py-1">Simulation</th>
                <th className="px-2 py-1">Tx</th>
                <th className="px-2 py-1">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b">
                  <td className="px-2 py-1 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-2 py-1">{log.symbol}</td>
                  <td className="px-2 py-1">{log.side}</td>
                  <td className="px-2 py-1">{log.amount}</td>
                  <td className="px-2 py-1">{log.price}</td>
                  <td className="px-2 py-1">{log.orderType}</td>
                  <td className="px-2 py-1">{log.simulation ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1">{log.tx || '-'}</td>
                  <td className="px-2 py-1 text-red-600">{log.error || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
import AIExpertAdvisor from './AIExpertAdvisor';
import React, { useState, useEffect } from 'react';
import CoinGecko from 'coingecko-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import TradingAdvisorFixed from './TradingAdvisorFixed';
import ResearchTab from './ResearchTab';
import { AdvancedTradingAI } from './AdvancedTradingAI';
import { PortfolioOverview } from './PortfolioOverview';
import { OrderBook } from './OrderBook';
import { supabase } from '@/lib/supabase';
import MetaMaskConnector from './MetaMaskConnector';
const TradingForm = React.lazy(() => import('./TradingForm').catch(() => ({
  default: () => <div>Trading form loading...</div>
})));
const MarketData = React.lazy(() => import('./MarketData').catch(() => ({
  default: () => <div>Market data loading...</div>
})));
const TradingAdvisor = React.lazy(() => import('./TradingAdvisorFixed').catch(() => ({
  default: () => <div>AI Advisor loading...</div>
})));
interface Account {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold: string;
}
interface Product {
  id: string;
  display_name: string;
  base_currency: string;
  quote_currency: string;
  price: string;
  price_change_24h: string;
}
const TradingDashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('BTC-USD');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [useCoinGecko, setUseCoinGecko] = useState<boolean>(true); // Toggle for CoinGecko or legacy

  useEffect(() => {
    const fetchGas = async () => {
      try {
        const apiKey = import.meta.env.VITE_GAS_API_KEY;
        const res = await fetch(`https://api.blocknative.com/gasprices/blockprices`, {
          headers: { Authorization: apiKey }
        });
        const data = await res.json();
        // Use estimated base fee (Gwei)
        setGasPrice(data?.blockPrices?.[0]?.estimatedPrices?.[0]?.price || '');
      } catch (e) {
        setGasPrice('');
      }
    };
    fetchGas();
  }, []);
  useEffect(() => {
    fetchAccountData();
    if (useCoinGecko) {
      fetchCoinGeckoData();
    } else {
      fetchMarketData();
    }
  }, [useCoinGecko]);

  const fetchAccountData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getAccounts' }
      });
      if (error) throw error;
      if (data.success) {
        setAccounts(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError('Failed to fetch account data: ' + (err.message || err));
    }
  };

  // Fetch live crypto listings from CoinGecko
  const fetchCoinGeckoData = async () => {
    setLoading(true);
    try {
      const CoinGeckoClient = new CoinGecko();
      // Top 100 coins by market cap, USD
      const res = await CoinGeckoClient.coins.markets({ vs_currency: 'usd', order: 'market_cap_desc', per_page: 100, page: 1, price_change_percentage: '24h' });
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((coin: any) => ({
          id: coin.symbol.toUpperCase() + '-USD',
          display_name: coin.name,
          base_currency: coin.symbol.toUpperCase(),
          quote_currency: 'USD',
          price: coin.current_price?.toString() || '0',
          price_change_24h: coin.price_change_percentage_24h?.toString() || '0',
        }));
        setProducts(mapped);
      } else {
        setError('Failed to fetch CoinGecko data');
      }
    } catch (err: any) {
      setError('Failed to fetch CoinGecko data: ' + (err.message || err));
    }
    setLoading(false);
  };

  // Legacy: fetch from Supabase/coinbase-trading-engine
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getProducts' }
      });
      if (error) throw error;
      if (data.success) {
        setProducts(data.data.slice(0, 10));
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError('Failed to fetch market data: ' + (err.message || err));
    }
    setLoading(false);
  };
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (parseFloat(account.balance) || 0);
  }, 0);
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  // Toggle between CoinGecko and legacy data
  const handleToggleSource = () => setUseCoinGecko((prev) => !prev);

  return (
    <div className="p-6 space-y-6">
    {/* Special AI Expert Advisor */}
    <div className="mb-6">
      <AIExpertAdvisor />
    </div>
    <div className="mb-2 flex items-center gap-4">
      {gasPrice && (
        <span className="text-sm text-blue-700">Current Gas Price: {gasPrice} Gwei</span>
      )}
      <Button size="sm" variant="outline" onClick={handleToggleSource}>
        {useCoinGecko ? 'Switch to Legacy Markets' : 'Switch to Live Crypto Listings'}
      </Button>
    </div>
    {gasPrice && (
      <div className="mb-2 text-sm text-blue-700">Current Gas Price: {gasPrice} Gwei</div>
    )}
    {/* MetaMask Wallet Connection */}
    <div className="mb-6">
      <MetaMaskConnector />
    </div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Activity className="w-4 h-4 mr-1" />
          Live Market Data
        </Badge>
      </div>

      {error && <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pending execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$247.83</div>
            <p className="text-xs text-muted-foreground">+2.4% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$43,287</div>
            <p className="text-xs text-green-600">+1.2% 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Trading Assistant - Always Visible */}
      <div className="mb-6">
        <AdvancedTradingAI symbol={selectedProduct} market="crypto" portfolio={accounts} />
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="advisor">Advisor</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        <TabsContent value="research">
          <React.Suspense fallback={<div className="p-8 text-center">Loading research tools...</div>}>
            <ResearchTab />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <React.Suspense fallback={<div className="p-8 text-center">Loading portfolio...</div>}>
                <PortfolioOverview accounts={accounts} />
              </React.Suspense>
            </div>
            <div>
              <AdvancedTradingAI symbol={selectedProduct} market="crypto" portfolio={accounts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trade" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <React.Suspense fallback={<div className="p-8 text-center">Loading trading form...</div>}>
                <TradingForm selectedProduct={selectedProduct} onProductChange={setSelectedProduct} products={products} />
              </React.Suspense>
            </div>
            <div>
              <AdvancedTradingAI symbol={selectedProduct} market="crypto" portfolio={accounts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <React.Suspense fallback={<div className="p-8 text-center">Loading orders...</div>}>
                <OrderBook />
              </React.Suspense>
            </div>
            <div>
              <AdvancedTradingAI symbol={selectedProduct} market="crypto" portfolio={accounts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <React.Suspense fallback={<div className="p-8 text-center">Loading market data...</div>}>
                <MarketData products={products} />
              </React.Suspense>
            </div>
            <div>
              <AdvancedTradingAI symbol={selectedProduct} market="crypto" portfolio={accounts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advisor">
          <React.Suspense fallback={<div className="p-8 text-center">Loading AI advisor...</div>}>
            <TradingAdvisorFixed />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    <footer className="mt-12 text-center text-xs text-gray-500 opacity-80">
      Powered by <span className="font-bold text-blue-700">Odyssey-1</span> — Your AI Trading & Research Platform
    </footer>
  </div>
  );
};
export default TradingDashboard;