import React, { useState, useEffect, Suspense, lazy } from 'react';
// import CoinGecko from 'https://cdn.skypack.dev/coingecko-api'; // Removed to fix build error
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wallet, TrendingUp, DollarSign } from 'lucide-react';
// import { ethers } from 'https://cdn.skypack.dev/ethers'; // Removed to fix build error

// --- Helper Components (assuming they exist elsewhere) ---
// These are placeholder components. Replace with your actual implementations.
const AIExpertAdvisor = () => <Card><CardHeader><CardTitle>AI Expert Advisor</CardTitle></CardHeader><CardContent><p>AI-powered trading insights will appear here.</p></CardContent></Card>;
const TradingAdvisorFixed = () => <Card><CardHeader><CardTitle>Trading Advisor</CardTitle></CardHeader><CardContent><p>Fixed trading advice will appear here.</p></CardContent></Card>;
const ResearchTab = () => <Card><CardHeader><CardTitle>Research</CardTitle></CardHeader><CardContent><p>Research tools and data will appear here.</p></CardContent></Card>;
const AdvancedTradingAI = ({ symbol, market, portfolio }: { symbol: string, market: string, portfolio: any }) => <Card><CardHeader><CardTitle>Advanced Trading AI</CardTitle></CardHeader><CardContent><p>Advanced AI analysis for {symbol} in the {market} market.</p></CardContent></Card>;
const PortfolioOverview = ({ walletAddress, walletBalance }: { walletAddress: string | null, walletBalance: string }) => (
    <Card>
        <CardHeader><CardTitle>Portfolio Overview</CardTitle></CardHeader>
        <CardContent>
            {walletAddress ? (
                <div>
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-mono break-all">{walletAddress}</p>
                    <p className="text-sm text-muted-foreground mt-4">Balance</p>
                    <p className="text-2xl font-bold">{parseFloat(walletBalance).toFixed(4)} ETH</p>
                </div>
            ) : (
                <p>Please connect your wallet to view your portfolio.</p>
            )}
        </CardContent>
    </Card>
);
const OrderBook = () => <Card><CardHeader><CardTitle>Order Book</CardTitle></CardHeader><CardContent><p>Live order book data will appear here.</p></CardContent></Card>;


// --- MetaMask Connector ---
// This component now handles connecting and passes the wallet info up
const MetaMaskConnector = ({ onConnect }: { onConnect: (address: string, balance: string) => void }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleConnect = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const address = accounts[0];

                // Get balance
                const balanceWei = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
                // Manual conversion from Wei (hexadecimal) to ETH string, removing 'ethers' dependency
                const balanceEth = (parseInt(balanceWei, 16) / 1e18).toString();
                
                onConnect(address, balanceEth);
                setErrorMessage(null);
            } catch (err: any) {
                setErrorMessage(err.message || "An error occurred while connecting.");
            }
        } else {
            setErrorMessage('MetaMask is not installed. Please install it to use this feature.');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={handleConnect}>Connect to MetaMask</Button>
                {errorMessage && <p className="text-red-600 mt-2 text-sm">{errorMessage}</p>}
            </CardContent>
        </Card>
    );
};


// --- Main Trading Dashboard Component ---
interface Product {
  id: string;
  display_name: string;
  base_currency: string;
  quote_currency: string;
  price: string;
  price_change_24h: string;
}

// Lazy load components for better performance
const TradingForm = lazy(() => import('./TradingForm').catch(() => ({ default: () => <div>Trading form loading...</div> })));
const MarketData = lazy(() => import('./MarketData').catch(() => ({ default: () => <div>Market data loading...</div> })));

const TradingDashboard: React.FC = () => {
    // State for MetaMask wallet
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<string>('0.00');

    // State for market data
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string>('BTC-USD');

    // Callback function for MetaMaskConnector to update parent state
    const handleWalletConnect = (address: string, balance: string) => {
        setWalletAddress(address);
        setWalletBalance(balance);
    };
    
    useEffect(() => {
        // Fetch live crypto listings directly from CoinGecko API
        const fetchCoinGeckoData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: '100',
                    page: '1',
                    sparkline: 'false',
                    price_change_percentage: '24h'
                });
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const data = await response.json();

                if (Array.isArray(data)) {
                    const mapped = data.map((coin: any) => ({
                        id: coin.symbol.toUpperCase() + '-USD',
                        display_name: coin.name,
                        base_currency: coin.symbol.toUpperCase(),
                        quote_currency: 'USD',
                        price: coin.current_price?.toString() || '0',
                        price_change_24h: coin.price_change_percentage_24h?.toString() || '0',
                    }));
                    setProducts(mapped);
                } else {
                    setError('Failed to fetch CoinGecko data. The API may be unavailable.');
                }
            } catch (err: any) {
                setError('An error occurred while fetching CoinGecko data: ' + (err.message || 'Unknown error'));
            }
            setLoading(false);
        };

        fetchCoinGeckoData();
    }, []);

    const btcPrice = products.find(p => p.base_currency === 'BTC')?.price || '...';
    const btcChange = products.find(p => p.base_currency === 'BTC')?.price_change_24h || '...';

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Trading Dashboard</h1>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    <Activity className="w-4 h-4 mr-2" />
                    Live Market Data via CoinGecko
                </Badge>
            </div>

            {error && (
                <Card className="border-red-300 bg-red-100">
                    <CardContent className="pt-6">
                        <p className="text-red-700 font-semibold">Error:</p>
                        <p className="text-red-700">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance (ETH)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parseFloat(walletBalance).toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground">{walletAddress ? 'From connected wallet' : 'Connect wallet to see balance'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">BTC Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${parseFloat(btcPrice).toLocaleString()}</div>
                        <p className={`text-xs ${parseFloat(btcChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(btcChange).toFixed(2)}% (24h)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">To be implemented</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">To be implemented</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Wallet Connection is now the primary source for account data */}
            {!walletAddress && (
                <MetaMaskConnector onConnect={handleWalletConnect} />
            )}

            <Tabs defaultValue="portfolio" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="trade">Trade</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="advisor">Advisor</TabsTrigger>
                    <TabsTrigger value="research">Research</TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="ml-4 text-gray-600">Loading Market Data...</p>
                    </div>
                ) : (
                    <>
                        <TabsContent value="portfolio">
                             <PortfolioOverview walletAddress={walletAddress} walletBalance={walletBalance} />
                        </TabsContent>
                        <TabsContent value="trade">
                            <Suspense fallback={<div className="p-8 text-center">Loading trading form...</div>}>
                                <TradingForm selectedProduct={selectedProduct} onProductChange={setSelectedProduct} products={products} />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value="orders">
                            <Suspense fallback={<div className="p-8 text-center">Loading orders...</div>}>
                                <OrderBook />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value="market">
                            <Suspense fallback={<div className="p-8 text-center">Loading market data...</div>}>
                                <MarketData products={products} />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value="advisor">
                             <TradingAdvisorFixed />
                        </TabsContent>
                         <TabsContent value="research">
                             <ResearchTab />
                        </TabsContent>
                    </>
                )}
            </Tabs>

            <footer className="mt-12 text-center text-xs text-gray-500 opacity-80">
                Powered by <span className="font-bold text-blue-700">Odyssey-1</span> — Your AI Trading & Research Platform
            </footer>
        </div>
    );
};

export default TradingDashboard;

