import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { TradingAdvisorFixed } from './TradingAdvisorFixed';
import { AdvancedTradingAI } from './AdvancedTradingAI';
import { PortfolioOverview } from './PortfolioOverview';
import { OrderBook } from './OrderBook';
import { supabase } from '@/lib/supabase';
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
  useEffect(() => {
    fetchAccountData();
    fetchMarketData();
  }, []);
  const fetchAccountData = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: {
          action: 'getAccounts'
        }
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
  const fetchMarketData = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: {
          action: 'getProducts'
        }
      });
      if (error) throw error;
      if (data.success) {
        setProducts(data.data.slice(0, 10));
      } else {
        setError(data.error);
      }
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch market data: ' + (err.message || err));
      setLoading(false);
    }
  };
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (parseFloat(account.balance) || 0);
  }, 0);
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }
  return <div className="p-6 space-y-6">
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
        <AdvancedTradingAI symbol={selectedProduct} context="market" data={{
        accounts,
        products,
        totalBalance
      }} />
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="advisor">Advisor</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <React.Suspense fallback={<div className="p-8 text-center">Loading portfolio...</div>}>
                <PortfolioOverview accounts={accounts} />
              </React.Suspense>
            </div>
            <div>
              <AdvancedTradingAI symbol={selectedProduct} context="portfolio" data={{
              accounts,
              totalBalance
            }} />
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
              <AdvancedTradingAI symbol={selectedProduct} context="trade" data={{
              selectedProduct,
              products
            }} />
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
              <AdvancedTradingAI symbol={selectedProduct} context="orders" data={{
              accounts
            }} />
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
              <AdvancedTradingAI symbol={selectedProduct} context="market" data={{
              products
            }} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advisor">
          <React.Suspense fallback={<div className="p-8 text-center">Loading AI advisor...</div>}>
            <TradingAdvisor />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>;
};
export default TradingDashboard;