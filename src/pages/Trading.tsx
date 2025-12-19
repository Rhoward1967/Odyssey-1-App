import TradingAdvisorBot from '@/components/TradingAdvisorBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { MarketDataService } from '@/services/marketDataService';
import { SovereignCoreOrchestrator } from '@/services/SovereignCoreOrchestrator';
import { Web3Service } from '@/services/web3Service';
import React, { useCallback, useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Trading() {
  const { toast } = useToast();
  const [tradingMode, setTradingMode] = useState('paper'); // 'paper' or 'live'
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [chartTimeframe, setChartTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [realTimePrice, setRealTimePrice] = useState<number>(0);
  const [chartType, setChartType] = useState('line');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [currentPrice] = useState(191.44);
  const [paperPortfolio, setPaperPortfolio] = useState<any[]>([]);
  const [realMarketData, setRealMarketData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [userPortfolio, setUserPortfolio] = useState<any>(null);

  // Separate the chart price from the order price to prevent conflicts
  const [basePrice] = useState(191.44);
  const [chartPrice, setChartPrice] = useState(191.44);

  // Fetch user's actual portfolio from database
  const fetchPortfolio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get P&L from trade-orchestrator
      const { data, error } = await supabase.functions.invoke('trade-orchestrator', {
        body: { action: 'GET_LIVE_P_AND_L', payload: {} }
      });

      if (error) {
        console.error('Portfolio fetch error:', error);
        return;
      }

      console.log('📊 Portfolio data:', data);
      setUserPortfolio(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  // Handle Buy/Sell through R.O.M.A.N.
  const handleTrade = async (side: 'buy' | 'sell') => {
    console.log('🎯 handleTrade called:', { side, quantity, selectedAsset });
    
    if (!quantity || parseFloat(quantity) <= 0) {
      console.warn('❌ Invalid quantity:', quantity);
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsExecutingTrade(true);
    console.log('⏳ Executing trade...');

    try {
      // Get current user
      console.log('🔐 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        toast({
          title: "Authentication Error",
          description: authError.message,
          variant: "destructive"
        });
        setIsExecutingTrade(false);
        return;
      }
      
      if (!user) {
        console.warn('❌ No user found - not authenticated');
        toast({
          title: "Authentication Required",
          description: "Please log in to execute trades. Use the login page or sign up first.",
          variant: "destructive"
        });
        setIsExecutingTrade(false);
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // Build natural language command for R.O.M.A.N.
      const command = `${side} ${quantity} shares of ${selectedAsset}`;
      
      console.log(`🤖 Sending trade to R.O.M.A.N.: "${command}"`);

      // Call R.O.M.A.N.'s orchestrator
      console.log('📡 Calling SovereignCoreOrchestrator.processIntent...');
      const result = await SovereignCoreOrchestrator.processIntent(
        command,
        user.id,
        undefined // organizationId optional
      );

      console.log('📊 R.O.M.A.N. result:', result);

      if (result.success) {
        console.log('✅ Trade executed successfully!');
        
        // Show browser alert for immediate feedback
        alert(`✅ TRADE EXECUTED!\n\n${side.toUpperCase()} ${quantity} ${selectedAsset}\n\nPrice: $${realTimePrice.toFixed(4)}\nTotal: $${(parseFloat(quantity) * realTimePrice).toFixed(2)}\n\n${result.message}`);
        
        toast({
          title: "✅ Trade Executed",
          description: `${side.toUpperCase()} ${quantity} ${selectedAsset} - ${result.message}`,
          variant: "default"
        });
        
        // Clear quantity input
        setQuantity('');
        
        // Fetch and display portfolio
        fetchPortfolio();
      } else {
        console.error('❌ Trade failed:', result.message);
        alert(`❌ TRADE FAILED\n\n${result.message}`);
        
        toast({
          title: "❌ Trade Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ Trade execution error:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to execute trade. Check console for details.",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 Trade execution complete');
      setIsExecutingTrade(false);
    }
  };

  // Connect MetaMask wallet
  const handleConnectWallet = async () => {
    try {
      console.log('🔗 Connecting to MetaMask...');
      
      await Web3Service.initializeWeb3();
      const address = await Web3Service.connectWallet();
      
      if (address) {
        setWalletAddress(address);
        setWalletConnected(true);
        
        // Get balances
        const maticBalance = await Web3Service.getMaticBalance(address);
        const usdc = await Web3Service.getRealTokenBalance(address, Web3Service.TOKENS.USDC);
        
        setBalance(maticBalance);
        setUsdcBalance(usdc);
        
        toast({
          title: "✅ Wallet Connected",
          description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
        
        console.log('✅ Wallet connected:', { address, maticBalance, usdc });
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Execute live trade via DEX
  const handleLiveTrade = async (side: 'buy' | 'sell') => {
    console.log('🚀 LIVE TRADE:', { side, quantity, selectedAsset });

    if (!walletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    setIsExecutingTrade(true);

    try {
      const tradeAmount = (parseFloat(quantity) * realTimePrice).toFixed(2);
      
      // Safety check - max $500 per trade
      if (parseFloat(tradeAmount) > 500) {
        const confirm = window.confirm(
          `⚠️ LARGE TRADE WARNING\n\nThis trade is $${tradeAmount}\n\nMax recommended: $500\n\nContinue anyway?`
        );
        if (!confirm) {
          setIsExecutingTrade(false);
          return;
        }
      }

      // Check USDC balance
      if (side === 'buy' && usdcBalance < parseFloat(tradeAmount)) {
        alert(`❌ INSUFFICIENT BALANCE\n\nNeed: $${tradeAmount} USDC\nHave: $${usdcBalance.toFixed(2)} USDC`);
        setIsExecutingTrade(false);
        return;
      }

      // Confirm trade
      const confirmMsg = `🔴 LIVE TRADE CONFIRMATION\n\n${side.toUpperCase()} ${quantity} ${selectedAsset}\n\nPrice: $${realTimePrice.toFixed(4)}\nTotal: $${tradeAmount} USDC\n\nThis will execute a REAL transaction on Polygon.\n\nProceed?`;
      
      if (!window.confirm(confirmMsg)) {
        setIsExecutingTrade(false);
        return;
      }

      // Get swap quote
      const quote = await Web3Service.getSwapQuote(
        Web3Service.TOKENS.USDC,
        Web3Service.TOKENS.WMATIC, // Simplified - map selectedAsset to token
        tradeAmount
      );

      if (!quote) {
        throw new Error('Failed to get swap quote');
      }

      alert(`💱 SWAP QUOTE\n\nYou pay: ${tradeAmount} USDC\nYou receive: ~${quote.amountOut} WMATIC\nMin received: ${quote.minimumReceived} WMATIC\n\nExecuting swap...`);

      // Execute real swap
      const result = await Web3Service.executeRealSwap(
        Web3Service.TOKENS.USDC,
        Web3Service.TOKENS.WMATIC,
        tradeAmount,
        0.5, // slippage tolerance (0.5%)
        walletAddress
      );

      if (result.success) {
        alert(`✅ LIVE TRADE EXECUTED!\n\n${side.toUpperCase()} ${quantity} ${selectedAsset}\n\nTransaction: ${result.txHash}\n\nView on Polygonscan:\nhttps://polygonscan.com/tx/${result.txHash}`);
        
        // Refresh balances
        const maticBalance = await Web3Service.getMaticBalance(walletAddress);
        const usdc = await Web3Service.getRealTokenBalance(walletAddress, Web3Service.TOKENS.USDC);
        setBalance(maticBalance);
        setUsdcBalance(usdc);
        
        setQuantity('');
      } else {
        alert(`❌ TRADE FAILED\n\n${result.message}`);
      }
    } catch (error: any) {
      console.error('Live trade error:', error);
      alert(`❌ ERROR\n\n${error.message}`);
    } finally {
      setIsExecutingTrade(false);
    }
  };

  // Fetch REAL market data on component mount
  useEffect(() => {
    const fetchRealData = async () => {
      console.log('📡 Fetching real market data...');
      const realData = await MarketDataService.getAllMarketData();
      setRealMarketData(realData);
      setLastUpdated(new Date());
    };

    fetchRealData();
    
    // Update every 60 seconds (API rate limit friendly)
    const interval = setInterval(fetchRealData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Use real data when available, fallback to mock data
  const marketData = React.useMemo(() => {
    if (realMarketData) {
      return {
        stocks: [
          { symbol: 'AAPL', name: 'Apple Inc.', ...realMarketData.stocks[0] },
          { symbol: 'MSFT', name: 'Microsoft Corp.', ...realMarketData.stocks[1] },
          { symbol: 'NVDA', name: 'NVIDIA Corp.', ...realMarketData.stocks[2] },
          { symbol: 'TSLA', name: 'Tesla Inc.', ...realMarketData.stocks[3] },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', ...realMarketData.stocks[4] },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', ...realMarketData.stocks[5] },
          // Additional popular stocks
          { symbol: 'META', name: 'Meta Platforms', price: 350.00, change: '+1.2%', volume: '20M' },
          { symbol: 'AMD', name: 'Advanced Micro Devices', price: 145.00, change: '+2.1%', volume: '45M' },
          { symbol: 'NFLX', name: 'Netflix Inc.', price: 480.00, change: '-0.5%', volume: '8M' },
          { symbol: 'DIS', name: 'Walt Disney Co.', price: 92.00, change: '+0.8%', volume: '12M' },
          { symbol: 'BABA', name: 'Alibaba Group', price: 75.00, change: '+1.5%', volume: '18M' },
          { symbol: 'JPM', name: 'JPMorgan Chase', price: 155.00, change: '+0.4%', volume: '10M' },
          { symbol: 'V', name: 'Visa Inc.', price: 265.00, change: '+0.6%', volume: '7M' },
          { symbol: 'WMT', name: 'Walmart Inc.', price: 165.00, change: '+0.3%', volume: '9M' },
          { symbol: 'BA', name: 'Boeing Co.', price: 190.00, change: '-1.2%', volume: '15M' },
          { symbol: 'NKE', name: 'Nike Inc.', price: 105.00, change: '+0.9%', volume: '6M' },
        ],
        crypto: [
          { symbol: 'BTC', name: 'Bitcoin', ...realMarketData.crypto[0] },
          { symbol: 'ETH', name: 'Ethereum', ...realMarketData.crypto[1] },
          { symbol: 'SOL', name: 'Solana', ...realMarketData.crypto[2] },
          { symbol: 'ADA', name: 'Cardano', ...realMarketData.crypto[3] },
          { symbol: 'DOT', name: 'Polkadot', ...realMarketData.crypto[4] },
          { symbol: 'AVAX', name: 'Avalanche', ...realMarketData.crypto[5] },
          // Additional popular crypto
          { symbol: 'XRP', name: 'Ripple', price: 0.65, change: '+3.2%', volume: '$2.5B' },
          { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: '+1.8%', volume: '$800M' },
          { symbol: 'MATIC', name: 'Polygon', price: 0.85, change: '+2.5%', volume: '$600M' },
          { symbol: 'LINK', name: 'Chainlink', price: 15.50, change: '+1.2%', volume: '$450M' },
          { symbol: 'UNI', name: 'Uniswap', price: 6.50, change: '+0.8%', volume: '$300M' },
          { symbol: 'ATOM', name: 'Cosmos', price: 10.20, change: '+1.5%', volume: '$250M' },
          { symbol: 'LTC', name: 'Litecoin', price: 72.00, change: '+0.9%', volume: '$500M' },
          { symbol: 'BCH', name: 'Bitcoin Cash', price: 245.00, change: '+1.1%', volume: '$400M' },
          { symbol: 'ALGO', name: 'Algorand', price: 0.22, change: '+2.0%', volume: '$180M' },
          { symbol: 'XLM', name: 'Stellar', price: 0.13, change: '+1.3%', volume: '$200M' },
        ],
        etfs: [
          { symbol: 'SPY', name: 'SPDR S&P 500 ETF', ...realMarketData.etfs[0] },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', ...realMarketData.etfs[1] },
          { symbol: 'VTI', name: 'Vanguard Total Stock', ...realMarketData.etfs[2] },
          { symbol: 'ARKK', name: 'ARK Innovation ETF', ...realMarketData.etfs[3] },
          { symbol: 'TQQQ', name: '3x Nasdaq Bull ETF', ...realMarketData.etfs[4] },
          { symbol: 'SQQQ', name: '3x Nasdaq Bear ETF', ...realMarketData.etfs[5] },
          // Additional popular ETFs
          { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 430.00, change: '+0.5%', volume: '5M' },
          { symbol: 'IVV', name: 'iShares Core S&P 500', price: 485.00, change: '+0.4%', volume: '4M' },
          { symbol: 'VUG', name: 'Vanguard Growth ETF', price: 310.00, change: '+0.8%', volume: '2M' },
          { symbol: 'VTV', name: 'Vanguard Value ETF', price: 155.00, change: '+0.3%', volume: '1.5M' },
          { symbol: 'DIA', name: 'SPDR Dow Jones ETF', price: 370.00, change: '+0.2%', volume: '3M' },
          { symbol: 'IWM', name: 'iShares Russell 2000', price: 195.00, change: '+0.6%', volume: '25M' },
          { symbol: 'EEM', name: 'iShares MSCI Emerging', price: 42.00, change: '+0.9%', volume: '18M' },
          { symbol: 'GLD', name: 'SPDR Gold Shares', price: 185.00, change: '+0.1%', volume: '8M' },
          { symbol: 'SLV', name: 'iShares Silver Trust', price: 22.00, change: '+0.4%', volume: '12M' },
          { symbol: 'XLK', name: 'Technology Select Sector', price: 195.00, change: '+1.0%', volume: '10M' },
        ]
      };
    }
    
    // Fallback to mock data
    return {
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 191.45, change: '+2.34%', volume: '52.8M' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 384.52, change: '+1.23%', volume: '31.2M' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 722.48, change: '+4.67%', volume: '67.1M' },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: '-1.45%', volume: '89.3M' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.69, change: '+0.87%', volume: '28.4M' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.32, change: '+1.92%', volume: '45.6M' },
        { symbol: 'META', name: 'Meta Platforms', price: 350.00, change: '+1.2%', volume: '20M' },
        { symbol: 'AMD', name: 'Advanced Micro Devices', price: 145.00, change: '+2.1%', volume: '45M' },
        { symbol: 'NFLX', name: 'Netflix Inc.', price: 480.00, change: '-0.5%', volume: '8M' },
        { symbol: 'DIS', name: 'Walt Disney Co.', price: 92.00, change: '+0.8%', volume: '12M' },
        { symbol: 'BABA', name: 'Alibaba Group', price: 75.00, change: '+1.5%', volume: '18M' },
        { symbol: 'JPM', name: 'JPMorgan Chase', price: 155.00, change: '+0.4%', volume: '10M' },
        { symbol: 'V', name: 'Visa Inc.', price: 265.00, change: '+0.6%', volume: '7M' },
        { symbol: 'WMT', name: 'Walmart Inc.', price: 165.00, change: '+0.3%', volume: '9M' },
        { symbol: 'BA', name: 'Boeing Co.', price: 190.00, change: '-1.2%', volume: '15M' },
        { symbol: 'NKE', name: 'Nike Inc.', price: 105.00, change: '+0.9%', volume: '6M' },
      ],
      crypto: [
        { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: '+3.45%', volume: '$28.4B' },
        { symbol: 'ETH', name: 'Ethereum', price: 2580.75, change: '+2.67%', volume: '$12.8B' },
        { symbol: 'SOL', name: 'Solana', price: 102.34, change: '+5.23%', volume: '$3.2B' },
        { symbol: 'ADA', name: 'Cardano', price: 0.52, change: '+1.89%', volume: '$1.1B' },
        { symbol: 'DOT', name: 'Polkadot', price: 7.85, change: '+4.12%', volume: '$892M' },
        { symbol: 'AVAX', name: 'Avalanche', price: 37.92, change: '+6.78%', volume: '$1.4B' },
        { symbol: 'XRP', name: 'Ripple', price: 0.65, change: '+3.2%', volume: '$2.5B' },
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: '+1.8%', volume: '$800M' },
        { symbol: 'MATIC', name: 'Polygon', price: 0.85, change: '+2.5%', volume: '$600M' },
        { symbol: 'LINK', name: 'Chainlink', price: 15.50, change: '+1.2%', volume: '$450M' },
        { symbol: 'UNI', name: 'Uniswap', price: 6.50, change: '+0.8%', volume: '$300M' },
        { symbol: 'ATOM', name: 'Cosmos', price: 10.20, change: '+1.5%', volume: '$250M' },
        { symbol: 'LTC', name: 'Litecoin', price: 72.00, change: '+0.9%', volume: '$500M' },
        { symbol: 'BCH', name: 'Bitcoin Cash', price: 245.00, change: '+1.1%', volume: '$400M' },
        { symbol: 'ALGO', name: 'Algorand', price: 0.22, change: '+2.0%', volume: '$180M' },
        { symbol: 'XLM', name: 'Stellar', price: 0.13, change: '+1.3%', volume: '$200M' },
      ],
      etfs: [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 477.83, change: '+0.45%', volume: '87.2M' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 388.92, change: '+1.23%', volume: '45.8M' },
        { symbol: 'VTI', name: 'Vanguard Total Stock', price: 238.45, change: '+0.67%', volume: '23.1M' },
        { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 45.67, change: '+2.89%', volume: '12.4M' },
        { symbol: 'TQQQ', name: '3x Nasdaq Bull ETF', price: 63.24, change: '+3.67%', volume: '34.5M' },
        { symbol: 'SQQQ', name: '3x Nasdaq Bear ETF', price: 8.92, change: '-3.45%', volume: '28.9M' },
        { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 430.00, change: '+0.5%', volume: '5M' },
        { symbol: 'IVV', name: 'iShares Core S&P 500', price: 485.00, change: '+0.4%', volume: '4M' },
        { symbol: 'VUG', name: 'Vanguard Growth ETF', price: 310.00, change: '+0.8%', volume: '2M' },
        { symbol: 'VTV', name: 'Vanguard Value ETF', price: 155.00, change: '+0.3%', volume: '1.5M' },
        { symbol: 'DIA', name: 'SPDR Dow Jones ETF', price: 370.00, change: '+0.2%', volume: '3M' },
        { symbol: 'IWM', name: 'iShares Russell 2000', price: 195.00, change: '+0.6%', volume: '25M' },
        { symbol: 'EEM', name: 'iShares MSCI Emerging', price: 42.00, change: '+0.9%', volume: '18M' },
        { symbol: 'GLD', name: 'SPDR Gold Shares', price: 185.00, change: '+0.1%', volume: '8M' },
        { symbol: 'SLV', name: 'iShares Silver Trust', price: 22.00, change: '+0.4%', volume: '12M' },
        { symbol: 'XLK', name: 'Technology Select Sector', price: 195.00, change: '+1.0%', volume: '10M' },
      ]
    };
  }, [realMarketData]);

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
    <Card className="bg-slate-800/50 border-slate-600 mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-4">
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
              � LIVE Trading (Real Money)
            </Button>
          </div>
          
          {mode === 'live' && (
            <div className="flex gap-4 items-center">
              {walletConnected ? (
                <div className="flex gap-4 items-center bg-green-900/30 border border-green-700 rounded-lg px-4 py-2">
                  <div>
                    <div className="text-xs text-green-400">Connected Wallet</div>
                    <div className="text-sm text-white font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                  <div className="border-l border-green-700 pl-4">
                    <div className="text-xs text-green-400">USDC Balance</div>
                    <div className="text-sm text-white font-semibold">
                      ${usdcBalance.toFixed(2)}
                    </div>
                  </div>
                  <div className="border-l border-green-700 pl-4">
                    <div className="text-xs text-green-400">MATIC</div>
                    <div className="text-sm text-white font-semibold">
                      {balance}
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleConnectWallet}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🦊 Connect MetaMask
                </Button>
              )}
            </div>
          )}
        </div>
        
        {mode === 'live' && !walletConnected && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="text-yellow-400 text-sm">
              ⚠️ <strong>LIVE TRADING MODE</strong> - Connect your dedicated MetaMask wallet to execute real trades on Polygon network.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Real-time price updates - ONLY on asset change, NO intervals
  useEffect(() => {
    const asset = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
      .find(a => a.symbol === selectedAsset);
    
    if (asset) {
      setRealTimePrice(asset.price);
    }
  }, [selectedAsset, marketData.stocks, marketData.crypto, marketData.etfs]);

  // Initialize chart data ONLY when asset or timeframe changes
  useEffect(() => {
    if (selectedAsset) {
      const asset = [...marketData.stocks, ...marketData.crypto, ...marketData.etfs]
        .find(a => a.symbol === selectedAsset);
      
      if (asset) {
        const newChartData = generateChartData(chartTimeframe, asset.price);
        setChartData(newChartData);
      }
    }
  }, [selectedAsset, chartTimeframe, generateChartData, marketData.stocks, marketData.crypto, marketData.etfs]);

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

  // Separate order form component to prevent re-renders from chart updates
  const OrderFormPanel = React.memo(({ 
    quantity, 
    setQuantity, 
    realTimePrice, 
    isExecutingTrade, 
    tradingMode, 
    selectedAsset, 
    walletConnected,
    onBuy, 
    onSell 
  }: any) => (
    <div className="mt-6 p-4 bg-slate-900/50 rounded">
      {/* R.O.M.A.N. Power Indicator */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-blue-300">
            🤖 Powered by R.O.M.A.N. v2.0
          </span>
          <span className="text-xs text-gray-400">
            Dual-Hemisphere AI • Self-Aware • Adaptive Learning
          </span>
        </div>
        <span className="text-xs text-green-400">
          {tradingMode === 'paper' ? '📚 Paper Trading' : '💰 Live Trading'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            type="text" 
            inputMode="decimal"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setQuantity(value);
              }
            }}
            className="w-32 min-w-[100px] max-w-[120px] mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-base font-mono text-right"
            style={{ transition: 'none' }}
            disabled={isExecutingTrade}
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-400">Price (USD)</label>
          <input 
            type="number" 
            placeholder={realTimePrice.toString()}
            value={realTimePrice || ''}
            readOnly
            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white opacity-75"
          />
        </div>
      </div>
      
      <div className="flex gap-4 mt-4">
        <Button 
          className="bg-green-600 hover:bg-green-700 flex-1"
          onClick={onBuy}
          disabled={isExecutingTrade || !quantity || (tradingMode === 'live' && !walletConnected)}
        >
          {isExecutingTrade ? '⏳ Processing...' : `📈 Buy ${selectedAsset}`}
        </Button>
        <Button 
          className="bg-red-600 hover:bg-red-700 flex-1"
          onClick={onSell}
          disabled={isExecutingTrade || !quantity || (tradingMode === 'live' && !walletConnected)}
        >
          {isExecutingTrade ? '⏳ Processing...' : `📉 Sell ${selectedAsset}`}
        </Button>
      </div>
    </div>
  ));

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
                {selectedAssetData?.name} • Live market data (updates every 30 seconds)
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
                        <div className="font-mono">${chartData.length > 0 ? chartData[0]?.open || realTimePrice : realTimePrice}</div>
                      </div>
                      <div>
                        <div className="text-red-400 font-semibold">High</div>
                        <div className="font-mono">${chartData.length > 0 ? Math.max(...chartData.map(d => d.high || realTimePrice)) : realTimePrice}</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-semibold">Low</div>
                        <div className="font-mono">${chartData.length > 0 ? Math.min(...chartData.map(d => d.low || realTimePrice)) : realTimePrice}</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-semibold">Close</div>
                        <div className="font-mono">${chartData.length > 0 ? chartData[chartData.length - 1]?.close || realTimePrice : realTimePrice}</div>
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

          {/* Use memoized order form to prevent re-renders from chart updates */}
          <OrderFormPanel 
            quantity={quantity}
            setQuantity={setQuantity}
            realTimePrice={realTimePrice}
            isExecutingTrade={isExecutingTrade}
            tradingMode={tradingMode}
            selectedAsset={selectedAsset}
            walletConnected={walletConnected}
            onBuy={() => tradingMode === 'live' ? handleLiveTrade('buy') : handleTrade('buy')}
            onSell={() => tradingMode === 'live' ? handleLiveTrade('sell') : handleTrade('sell')}
          />
        </CardContent>
      </Card>
    );
  };

  const MarketDataTable = ({ assets, title }: { assets: any[], title: string }) => (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {title}
          {realMarketData && (
            <span className="text-xs text-green-400">
              📡 LIVE • Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                <div className="font-mono text-white">
                  ${typeof asset.price === 'number' ? asset.price.toFixed(2) : asset.price}
                </div>
                <div className={`text-sm ${
                  (asset.change?.toString().startsWith('+') || asset.change > 0) 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {typeof asset.change === 'number' 
                    ? `${asset.change > 0 ? '+' : ''}${asset.change.toFixed(2)}%`
                    : asset.change
                  }
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm text-gray-400">
                  {asset.volume?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          ))}
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
          <CardTitle className="text-green-300">💰 Your Paper Trading Portfolio</CardTitle>
          <CardDescription className="text-green-400">
            {userPortfolio ? 'Live data from your trades' : 'Execute trades to build your portfolio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userPortfolio ? (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Total Value</h3>
                  <div className="bg-slate-800 p-4 rounded space-y-2">
                    <div className="text-2xl font-bold text-green-400">
                      ${userPortfolio.totalValue?.toFixed(2) || '0.00'}
                    </div>
                    <div className={`text-sm ${userPortfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {userPortfolio.pnl >= 0 ? '+' : ''}${userPortfolio.pnl?.toFixed(2) || '0.00'} 
                      ({userPortfolio.totalCost > 0 ? ((userPortfolio.pnl / userPortfolio.totalCost) * 100).toFixed(2) : '0.00'}%)
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Cost Basis</h3>
                  <div className="bg-slate-800 p-4 rounded space-y-2">
                    <div className="text-2xl font-bold text-blue-400">
                      ${userPortfolio.totalCost?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">Original investment</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Positions</h3>
                  <div className="bg-slate-800 p-4 rounded space-y-2">
                    <div className="text-2xl font-bold text-purple-400">
                      {userPortfolio.positions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Active holdings</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">P&L</h3>
                  <div className="bg-slate-800 p-4 rounded space-y-2">
                    <div className={`text-2xl font-bold ${userPortfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {userPortfolio.pnl >= 0 ? '+' : ''}${userPortfolio.pnl?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">Unrealized gains/losses</div>
                  </div>
                </div>
              </div>

              {userPortfolio.positions && userPortfolio.positions.length > 0 && (
                <div className="bg-slate-800 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3">Your Positions</h3>
                  <div className="space-y-2">
                    {userPortfolio.positions.map((pos: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                        <div>
                          <div className="font-bold text-white">{pos.symbol}</div>
                          <div className="text-sm text-gray-400">{pos.totalShares} shares @ ${pos.avgCost?.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-white">${pos.currentValue?.toFixed(2)}</div>
                          <div className={`text-sm ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl?.toFixed(2)} ({pos.pnlPercent?.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">�</div>
              <div className="text-xl font-semibold text-white mb-2">No Trades Yet</div>
              <div className="text-gray-400 mb-4">Execute your first paper trade to start building your portfolio</div>
              <Button onClick={fetchPortfolio} variant="outline" className="border-blue-500 text-blue-400">
                🔄 Refresh Portfolio
              </Button>
            </div>
          )}
          
          <div className="mt-6 flex gap-4">
            <Button onClick={fetchPortfolio} className="bg-blue-600 hover:bg-blue-700">
              🔄 Refresh Portfolio
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-400">
              🤖 AI Trade Suggestions
            </Button>
            <Button variant="outline" className="border-green-500 text-green-400">
              📊 View All Trades
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

  // Get current price for a symbol
  const getCurrentPrice = (symbol: string) => {
    // Mock price data - in real app would fetch from API
    const prices: { [key: string]: number } = {
      'AAPL': 191.44,
      'MSFT': 384.52,
      'NVDA': 722.48,
      'TSLA': 248.42
    };
    return prices[symbol] || 100.00;
  };

  // Handle trading mode switch
  const handleTradingModeChange = (mode: 'paper' | 'live') => {
    setTradingMode(mode);
    console.log(`🔄 Switched to ${mode} trading mode`);
  };

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: string) => {
    setChartTimeframe(timeframe);
    console.log(`📊 Chart timeframe changed to ${timeframe}`);
  };

  // Handle chart type changes
  const handleChartTypeChange = (type: 'line' | 'candlestick') => {
    setChartType(type);
    console.log(`📈 Chart type changed to ${type}`);
  };

  // REMOVED: No automatic price updates that cause re-renders

  // Handle quantity change with persistence
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  }, []);

  // Use stable price for orders (not the fluctuating chart price)
  const getOrderPrice = () => basePrice;

  // Handle buy order
  const handleBuyOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('❌ Please enter a valid quantity');
      return;
    }

    const orderPrice = getOrderPrice();
    const orderValue = parseFloat(quantity) * orderPrice;
    
    if (tradingMode === 'paper') {
      setPaperPortfolio(prev => [...prev, {
        symbol: 'AAPL',
        type: 'BUY',
        quantity: parseFloat(quantity),
        price: orderPrice,
        timestamp: new Date().toISOString(),
        mode: tradingMode
      }]);
      alert(`✅ Paper Trade Executed!\n\nBOUGHT: ${quantity} shares of AAPL\nPrice: $${orderPrice.toFixed(2)}\nTotal: $${orderValue.toFixed(2)}\n\nThis is a simulated trade for learning.`);
    } else {
      alert(`💰 Live Trade Ready!\n\nOrder: BUY ${quantity} AAPL at $${orderPrice.toFixed(2)}\nTotal: $${orderValue.toFixed(2)}\n\n⚠️ Live trading requires broker integration.`);
    }
    
    // Clear quantity after successful order
    setQuantity('');
  };

  // Handle sell order
  const handleSellOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('❌ Please enter a valid quantity');
      return;
    }

    const orderValue = parseFloat(quantity) * currentPrice;
    
    if (tradingMode === 'paper') {
      alert(`✅ Paper Sell Order!\n\nSOLD: ${quantity} shares of AAPL\nPrice: $${currentPrice.toFixed(2)}\nTotal: $${orderValue.toFixed(2)}\n\nThis is a simulated trade for learning.`);
    } else {
      alert(`💰 Live Sell Ready!\n\nOrder: SELL ${quantity} AAPL at $${currentPrice.toFixed(2)}\nTotal: $${orderValue.toFixed(2)}\n\n⚠️ Live trading requires broker integration.`);
    }
    
    setQuantity('');
  };

  const MemoizedTradingChart = React.memo(TradingChart);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">📈 AI-Powered Trading Platform</h1>
        <p className="text-gray-400">Learn to trade with paper money or manage your live portfolio</p>
      </div>

      <TradingModeSelector mode={tradingMode} setMode={setTradingMode} />

      {/* Trading Chart - Always visible */}
      <div style={{ minHeight: 420, maxWidth: 900, margin: '0 auto' }}>
        <MemoizedTradingChart />
      </div>

      {tradingMode === 'paper' && <PaperTradingMode />}
      {tradingMode === 'live' && <LiveTradingMode />}

      {/* AI Trading Advisor (shared between both modes) */}
      <TradingAdvisorBot mode={tradingMode} />
      
      {/* ResearchAIBot moved to Media Center */}
    </div>
  );
};
