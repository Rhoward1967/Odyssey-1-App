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
import { usePositionLots } from '@/contexts/PositionLotsProvider';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Bot,
  Brain,
  Cpu,
  MessageCircle,
  RefreshCw,
  Target,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// NOTE: Added Target and Star to imports to fix the final compilation error.

// Interface Definitions (Corrected)
interface Lot {
    id: string;
    shares: number;
    costPerShare: number;
    date: string;
    source: string;
}

interface LivePosition {
	symbol: string;
	averageCost: number;
	totalShares: number;
	currentPrice: number;
	currentValue: number;
	pnl: number;
	pnlPercent: number;
    totalCost: number; // Added to match mock data consumption
    lots: Lot[]; // Added to match mock data consumption
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

interface ChatMessage {
	id: string;
	type: 'bot' | 'user';
	message: string;
	timestamp: Date;
}

const TradingDashboard: React.FC = () => {
	const { toast } = useToast();
	const { balance, adjustBalance } = useFunding();
	const { addPositionLot, getAggregatedPositions } = usePositionLots(); 
	
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [trading, setTrading] = useState(false);
	const [activeTab, setActiveTab] = useState('trading'); // Set default to trading view
	
	const [livePositions, setLivePositions] = useState<LivePosition[]>([]);
	const [portfolioValue, setPortfolioValue] = useState(0);
	const [totalPnl, setTotalPnl] = useState(0);
	const [totalCost, setTotalCost] = useState(0);
	
	const [aiSignals, setAiSignals] = useState<AIAdvice[]>([]);
	const [orders, setOrders] = useState<Trade[]>([]);
	const [aiEnabled, setAiEnabled] = useState(true);

	const [selectedAsset, setSelectedAsset] = useState('AAPL');
	const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
	const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
	const [quantity, setQuantity] = useState('');
	const [price, setPrice] = useState('');
	
	// --- CHATBOT STATE ---
	const [chatQuery, setChatQuery] = useState('');
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
		[
			{
				id: 'chat-1',
				type: 'bot',
				message: `🤖 **Genesis AI Advisor Online**\n\nI'm ready for market queries. Type your question or use the quick actions below.`,
				timestamp: new Date()
			}
		]
	);

	const fetchLivePortfolioData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			// Mock API call to get live data from trade-orchestrator
			// Using mock data for positions to ensure UI renders while backend is debugged
			const mockPositions: LivePosition[] = [
				{ 
					symbol: 'MSFT', averageCost: 150.00, totalShares: 10, currentPrice: 155.50, currentValue: 1555.00, pnl: 55.00, pnlPercent: 3.67,
					totalCost: 1500.00, 
					lots: [{ id: 'l1', shares: 10, costPerShare: 150.00, date: '2023-01-01', source: 'Initial Buy' }] 
				},
				{ 
					symbol: 'TSLA', averageCost: 800.00, totalShares: 2, currentPrice: 790.00, currentValue: 1580.00, pnl: -20.00, pnlPercent: -1.25,
					totalCost: 1600.00, 
					lots: [{ id: 'l2', shares: 2, costPerShare: 800.00, date: '2023-01-01', source: 'Initial Buy' }]
				},
			]
			
			const totalValue = mockPositions.reduce((sum, p) => sum + p.currentValue, 0);
			const totalPnl = mockPositions.reduce((sum, p) => sum + p.pnl, 0);
			const totalCost = mockPositions.reduce((sum, p) => sum + p.totalCost, 0); // Correctly calculate total cost from mock
			

			setLivePositions(mockPositions);
			setPortfolioValue(totalValue);
			setTotalPnl(totalPnl);
			setTotalCost(totalCost);

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
			// Mock AI call to get advice
			const mockAnalysis: AIAdvice = {
				source: 'R.O.M.A.N. Sovereign-Core',
				analysis: `The system detected a high-volume sell-off. Maintain holding for long-term outlook. Target: ${formatCurrency(Math.random() * 50 + 100)}. R.O.M.A.N. is running a Consensus Check: Creative Hemisphere is 95% confident in a HOLD signal.`,
				symbol: symbol,
			};
			
			setAiSignals(prev => [mockAnalysis, ...prev].slice(0, 5));
			toast({ title: `AI Analysis for ${symbol} Complete`, description: "Check the AI Advisor tab."});
		} catch (err: any) {
			setError(`Failed to get AI analysis: ${err.message}`);
		} finally {
			setLoading(false);
		}
	}, [toast]);
	
	// --- CHATBOT HANDLER ---
	const handleAIChat = (e: React.FormEvent, intent?: string) => {
		e.preventDefault();
		const query = intent || chatQuery;
		if (!query.trim()) return;

		const userMsg: ChatMessage = {
			id: Date.now().toString(),
			type: 'user',
			message: query,
			timestamp: new Date()
		};

		// Mock R.O.M.A.N. response
		const botResponse: ChatMessage = {
			id: (Date.now() + 1).toString(),
			type: 'bot',
			message: `📊 R.O.M.A.N. Analysis: "${query}" - The Sovereign-Core is initiating a Creative Hemisphere query. Please check the AI Advisor tab for generated analysis.`,
			timestamp: new Date()
		};

		setChatHistory(prev => [...prev, userMsg, botResponse]);
		setChatQuery('');
		
		// Simulate the analysis trigger
		// Using setTimeout to simulate network delay before analysis appears
		setTimeout(() => getAIAnalysis(query.split(' ')[1] || 'MSFT'), 1500); 
	};
	// -----------------------

	const executePaperTrade = async () => {
		if (!selectedAsset || !quantity || trading) return;
		const tradeQuantity = parseFloat(quantity);
		const tradePrice = orderType === 'limit' ? parseFloat(price) || 0 : 0; 
		if (tradeQuantity <= 0) return;

		setTrading(true);
		try {
			// Mock trade execution
			const executedPrice = tradePrice || 150.00; // Mock price
			const tradeValue = tradeQuantity * executedPrice;
			
			addPositionLot(selectedAsset, orderSide === 'buy' ? tradeQuantity : -tradeQuantity, executedPrice, `Paper Trade ${orderSide}`);
			adjustBalance(orderSide === 'buy' ? -tradeValue : tradeValue);
			await fetchLivePortfolioData(); 
			setQuantity('');
			setPrice('');
			toast({ title: `✅ Paper Trade Executed`, description: `${orderSide.toUpperCase()} ${tradeQuantity} ${selectedAsset} @ ${formatCurrency(executedPrice)}` });
			
			const newTrade: Trade = {
				id: Date.now().toString(),
				symbol: selectedAsset,
				action: orderSide,
				quantity: tradeQuantity,
				price: executedPrice,
				total: tradeValue,
				timestamp: new Date().toISOString(),
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
					<Button onClick={fetchLivePortfolioData} variant="outline" size="sm" disabled={loading} className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
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
				{/* Summary Cards JSX */}
				
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
			<Tabs defaultValue="trading" className="space-y-6" onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
					<TabsTrigger value="trading" className="data-[state=active]:bg-blue-600">Trade</TabsTrigger>
					<TabsTrigger value="positions" className="data-[state=active]:bg-blue-600">Positions</TabsTrigger>
					<TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">AI Advisor</TabsTrigger>
					<TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
				</TabsList>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* LEFT COLUMN: TRADE EXECUTION AND POSITIONS/ORDERS */}
					<div className="lg:col-span-2 space-y-6">
						
						{/* TRADE EXECUTION PANEL */}
						<TabsContent value="trading">
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white">Execute Trade</CardTitle>
									<CardDescription className="text-gray-400">Paper trading with real market data</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Trade Form fields JSX */}
									
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
										<Button 
											onClick={executePaperTrade}
											disabled={trading || !selectedAsset || !quantity}
											className="bg-blue-600 hover:bg-blue-700"
										>
											{trading ? 'Executing...' : `${orderSide.toUpperCase()} ${selectedAsset}`}
										</Button>
										
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

						{/* POSITIONS & ORDERS PANEL */}
						<TabsContent value="positions">
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white">Live Portfolio Holdings</CardTitle>
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

						<TabsContent value="orders">
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white">Order History</CardTitle>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-[400px]">
										{orders.length === 0 ? (
											<p className="text-gray-500 text-center py-10">No orders executed yet.</p>
										) : (
											// Orders List JSX
											<div className="space-y-3">
												{orders.map((order) => (
													<div key={order.id} className="p-4 border border-gray-700 rounded-lg bg-gray-900">
														<div className="flex justify-between items-center">
															<div>
																<p className="font-medium text-white">
																	{order.action.toUpperCase()} {order.quantity} {order.symbol}
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
						
					</div>
					
					{/* RIGHT COLUMN: AI CHATBOT (Always visible for AI tab) */}
					<div className="lg:col-span-1 space-y-6">
						<TabsContent value="ai">
							<Card className="bg-gray-800 border-purple-700 h-full flex flex-col">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-purple-400">
										<Brain className="h-6 w-6" />
										R.O.M.A.N. Trading Advisor
										<Badge className="bg-purple-900/50 text-purple-300 border-purple-600">Sovereign-Core</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col">
									{/* Chat History Area */}
									<div className="h-96 min-h-[300px] overflow-y-auto space-y-3 mb-4 p-4 border border-gray-700 rounded bg-gray-900/50 flex-1">
										{chatHistory.length > 0 ? (
											chatHistory.map((msg) => (
												<div
													key={msg.id}
													className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
												>
													<div
														className={`max-w-[85%] rounded-lg p-3 ${
															msg.type === 'user'
																? 'bg-blue-600 text-white'
																: 'bg-gray-700 text-gray-200'
														}`}
													>
														<div className="flex items-start gap-2">
															{msg.type === 'bot' ? (
																<Bot className="h-4 w-4 mt-1 text-purple-400" />
															) : (
																<User className="h-4 w-4 mt-1" />
															)}
															<div>
																<p className="text-sm whitespace-pre-wrap">{msg.message}</p>
																<p className="text-xs opacity-70 mt-1">
																	{msg.timestamp.toLocaleTimeString()}
																</p>
															</div>
														</div>
													</div>
												</div>
											))
										) : (
											<div className="text-center text-gray-500 pt-16">
												<Bot className="h-12 w-12 mx-auto mb-2" />
												<p>Advisor is offline. Start the conversation with a trading query!</p>
											</div>
										)}
									</div>
									
									{/* Chat Input */}
									<form onSubmit={(e) => handleAIChat(e)} className="flex gap-2 mt-auto">
										<Input
											value={chatQuery}
											onChange={(e) => setChatQuery(e.target.value)}
											placeholder="Ask R.O.M.A.N. about trading..."
											className="flex-1 p-2 border rounded bg-gray-700 text-white placeholder-gray-500"
										/>
										<Button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
											<MessageCircle className="h-4 w-4" />
										</Button>
									</form>
									
									{/* Quick Action Buttons */}
									<div className="grid grid-cols-2 gap-2 mt-2">
										<Button 
											variant="outline" 
											size="sm" 
											onClick={(e) => handleAIChat(e, 'Analyze GOOGL stock')}
											className="bg-gray-700 border-purple-600 text-purple-400 hover:bg-gray-600"
										>
											<Zap className="w-4 h-4 mr-1" /> Quick Analysis
										</Button>
										<Button 
											variant="outline" 
											size="sm" 
											onClick={(e) => handleAIChat(e, 'What is the risk exposure?')}
											className="bg-gray-700 border-purple-600 text-purple-400 hover:bg-gray-600"
										>
											<AlertTriangle className="w-4 h-4 mr-1" /> Risk Check
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
						
					</div>
				</div>
				{/* AI Recommendations Panel - Now rendered outside the grid for full width */}
				<TabsContent value="ai">
					<Card className="bg-gray-800 border-gray-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center gap-2">
								<Target className="h-5 w-5 text-cyan-400" />
								R.O.M.A.N. Analysis Archive
							</CardTitle>
						</CardHeader>
						<CardContent>
							{aiSignals.length === 0 ? (
								<div className="text-center py-8">
									<Brain className="h-16 w-16 mx-auto text-gray-500 mb-4" />
									<p className="text-gray-400 text-lg">No R.O.M.A.N. insights generated yet.</p>
									<p className="text-gray-500">Run a query in the AI Advisor tab to generate new analysis.</p>
								</div>
							) : (
								// Recommendations List JSX
								<div className="space-y-4">
									{aiSignals.map((rec, index) => (
										<div key={index} className="p-6 border rounded-lg bg-gray-900">
											<p className="text-sm font-medium text-cyan-400">
												{rec.source} Analysis for {rec.symbol || 'Query'}:
											</p>
											<p className="text-sm whitespace-pre-wrap text-gray-300 mt-2">
												{rec.analysis}
											</p>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

			</Tabs>
		</div>
	);
};

export default TradingDashboard;
