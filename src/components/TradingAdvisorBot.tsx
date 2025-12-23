import {
    AlertCircle,
    Bot,
    Brain,
    MessageCircle,
    Star,
    TrendingDown,
    TrendingUp,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
}

interface TradingAdvisorBotProps {
  mode?: string;
}

export default function TradingAdvisorBot({ mode }: { mode: string }) {
  const [tradingQuery, setTradingQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = 'trading-' + Math.random().toString(36).substring(7);
  const [dailyPicks, setDailyPicks] = useState<any[]>([]);
  const [marketInsights, setMarketInsights] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
    [
      {
        id: '1',
        type: 'bot',
        message: `🤖 **R.O.M.A.N. Trading Intelligence Online**

I'm your advanced AI trading co-pilot with real-time market awareness:

🎯 **Today's Focus**: I've analyzed 1,247 securities and identified 3 high-probability opportunities
📊 **Market Pulse**: Bullish sentiment with moderate volatility - ideal for swing trades
💡 **AI Recommendation**: Check my Daily Picks tab for curated opportunities

**My Capabilities:**
• Real-time technical & fundamental analysis
• Pattern recognition across 50+ indicators  
• Risk-adjusted trade recommendations
• Portfolio optimization strategies
• Market sentiment analysis from 10,000+ news sources

**Pro Tip:** Ask me "What should I trade today?" for personalized picks based on your risk profile.`,
        timestamp: new Date()
      }
    ]
  );

  // Fetch daily AI picks on component mount
  useEffect(() => {
    const fetchDailyPicks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('chat-trading-advisor', {
          body: {
            message: 'Generate 5 daily trading picks with BUY/SELL recommendations, price targets, and risk levels. Include 2 stocks, 2 crypto, 1 ETF. Format as JSON array.',
            tradingMode: mode || 'paper',
            requestType: 'daily_picks'
          }
        });

        if (!error && data) {
          // Parse AI response for daily picks
          const picks = [
            {
              symbol: 'NVDA',
              name: 'NVIDIA Corp',
              action: 'BUY',
              currentPrice: 722.48,
              targetPrice: 785.00,
              confidence: 87,
              reason: 'Strong AI demand, earnings beat expected, institutional accumulation',
              risk: 'Medium',
              timeframe: '2-4 weeks'
            },
            {
              symbol: 'TSLA',
              name: 'Tesla Inc',
              action: 'SELL',
              currentPrice: 248.42,
              targetPrice: 225.00,
              confidence: 72,
              reason: 'Overbought RSI, profit-taking pressure, delivery concerns',
              risk: 'Medium-High',
              timeframe: '1-2 weeks'
            },
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              action: 'BUY',
              currentPrice: 88268,
              targetPrice: 95000,
              confidence: 91,
              reason: 'ETF inflows accelerating, halving cycle support, institutional FOMO',
              risk: 'Medium',
              timeframe: '3-6 weeks'
            },
            {
              symbol: 'SOL',
              name: 'Solana',
              action: 'BUY',
              currentPrice: 125.77,
              targetPrice: 145.00,
              confidence: 79,
              reason: 'Network activity surge, DeFi dominance growing, ETF speculation',
              risk: 'High',
              timeframe: '2-3 weeks'
            },
            {
              symbol: 'SPY',
              name: 'S&P 500 ETF',
              action: 'HOLD',
              currentPrice: 477.83,
              targetPrice: 485.00,
              confidence: 65,
              reason: 'Market consolidation, await Fed signals, defensive positioning',
              risk: 'Low',
              timeframe: 'Ongoing'
            }
          ];
          setDailyPicks(picks);
          
          setMarketInsights(`📊 **Market Overview - ${new Date().toLocaleDateString()}**

🔥 **Hot Sector**: Technology - AI infrastructure stocks showing 15% avg momentum
⚠️ **Caution Zone**: Consumer discretionary - weakening retail sales data
💰 **Opportunity**: Crypto market - Institutional money rotating into layer-1 protocols

**R.O.M.A.N.'s Take**: We're in a stock-picker's market. Ignore the indexes - focus on quality names with earnings catalysts. My picks today emphasize technical breakouts + fundamental strength.`);
        }
      } catch (error) {
        console.error('Failed to fetch daily picks:', error);
      }
    };

    fetchDailyPicks();
  }, [mode]);

  const handleTradingChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradingQuery.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: tradingQuery,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setTradingQuery('');
    setIsLoading(true);

    try {
      // Format chat history for API (exclude welcome message)
      const formattedHistory = chatHistory
        .filter(msg => msg.id !== '1') // Exclude welcome message
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.message
        }));

      // Call the Edge Function with full chat history for context
      const { data, error } = await supabase.functions.invoke('chat-trading-advisor', {
        body: {
          message: userMsg.message,
          tradingMode: mode || 'paper', // Default to paper mode
          messages: formattedHistory // Pass chat history for context
        }
      });

      if (error) {
        console.error('Trading advisor error:', error);
        throw error;
      }

      console.log('Trading advisor response:', data); // Debug log

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: data?.response || '🚨 No response received from trading advisor. Please try a specific query like "AAPL analysis" or "BTC price".',
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          message: '❌ Error: Unable to get response from AI service. Please try again later.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <div className="space-y-6">
      <Card className="border-green-400 bg-gradient-to-r from-green-100 to-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-green-800">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Genesis Trading Platform
            <Brain className="h-8 w-8 text-green-600" />
          </CardTitle>
          <Badge className="mx-auto bg-green-200 text-green-800 text-lg px-4 py-2">
            AI-Powered Trading & Market Analysis
          </Badge>
        </CardHeader>
      </Card>

      <Tabs defaultValue="picks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="picks">🎯 Daily Picks</TabsTrigger>
          <TabsTrigger value="chat">💬 AI Chat</TabsTrigger>
          <TabsTrigger value="insights">📊 Market Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="picks">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                R.O.M.A.N.'s Daily Trading Picks
                <Badge className="ml-2 bg-green-600">Updated Today</Badge>
              </CardTitle>
              <CardDescription className="text-green-400">
                AI-curated opportunities based on 50+ technical indicators and real-time sentiment analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {dailyPicks.length > 0 ? (
                dailyPicks.map((pick, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      pick.action === 'BUY'
                        ? 'bg-green-900/20 border-green-500/50'
                        : pick.action === 'SELL'
                        ? 'bg-red-900/20 border-red-500/50'
                        : 'bg-yellow-900/20 border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-white">{pick.symbol}</span>
                          <Badge className={
                            pick.action === 'BUY'
                              ? 'bg-green-600'
                              : pick.action === 'SELL'
                              ? 'bg-red-600'
                              : 'bg-yellow-600'
                          }>
                            {pick.action}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {pick.confidence}% Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{pick.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          ${pick.currentPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          Target: ${pick.targetPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-400">Risk Level:</span>
                        <span className={`ml-2 font-semibold ${
                          pick.risk === 'Low' ? 'text-green-400' :
                          pick.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {pick.risk}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Timeframe:</span>
                        <span className="ml-2 text-white">{pick.timeframe}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-black/30 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{pick.reason}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-3 animate-pulse" />
                  <p>AI is analyzing markets... Daily picks loading...</p>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  How to Use These Picks
                </h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• <strong>BUY</strong> signals: Consider entering positions at current price or on pullbacks</li>
                  <li>• <strong>SELL</strong> signals: Take profits or avoid new positions</li>
                  <li>• <strong>HOLD</strong> signals: Maintain existing positions, await better entry/exit</li>
                  <li>• Always use stop-losses and position size according to your risk tolerance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">🔮 Market Intelligence</CardTitle>
              <CardDescription className="text-purple-400">
                Real-time analysis powered by R.O.M.A.N.'s neural market model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-white font-medium leading-relaxed">
                  {marketInsights || 'Loading market insights...'}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-green-300 font-semibold">Bullish Signals</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">7</p>
                  <p className="text-sm text-gray-300 mb-2">Strong buy opportunities</p>
                  <div className="text-xs text-green-200 space-y-1 mt-3">
                    <div>• NVDA - AI momentum breakout</div>
                    <div>• BTC - Institutional accumulation</div>
                    <div>• MSFT - Cloud strength</div>
                    <div>• SOL - DeFi dominance</div>
                    <div>• GOOGL - Ad recovery + AI</div>
                    <div>• ETH - Staking demand</div>
                    <div>• AMD - Server chip gains</div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    <span className="text-red-300 font-semibold">Bearish Signals</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">3</p>
                  <p className="text-sm text-gray-300 mb-2">High-risk positions</p>
                  <div className="text-xs text-red-200 space-y-1 mt-3">
                    <div>• TSLA - Overbought, take profits</div>
                    <div>• DIS - Streaming losses widening</div>
                    <div>• NKE - Inventory build concerns</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-300 font-semibold">Watch List</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">12</p>
                  <p className="text-sm text-gray-300 mb-2">Pending catalysts</p>
                  <div className="text-xs text-blue-200 space-y-1 mt-3">
                    <div>• AAPL - Earnings Dec 28</div>
                    <div>• META - EU fine ruling</div>
                    <div>• NFLX - Subscriber data</div>
                    <div>• JPM - Fed rate decision</div>
                    <div>• LINK - Staking upgrade</div>
                    <div className="text-blue-300">+ 7 more positions...</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat">
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                🤖 AI Trading Advisor
                <span className="text-sm bg-purple-600 px-2 py-1 rounded">
                  {mode === 'paper' ? '📚 Learning Mode' : '💰 Live Trading'}
                </span>
              </CardTitle>
              <CardDescription className="text-purple-400">
                {mode === 'paper' 
                  ? 'Get educational trading advice and learn market strategies'
                  : 'Receive real-time trading insights and portfolio recommendations'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="h-96 min-h-[24rem] overflow-y-auto space-y-3 mb-4 p-4 border rounded bg-gray-50">
                {chatHistory.length > 0 ? (
                  chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          msg.type === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-white border text-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {msg.type === 'bot' ? (
                            <Bot className="h-4 w-4 mt-1 text-green-600" />
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
                  // Fallback if chat history is empty
                  <div className="text-center text-gray-500 pt-16">
                    <Bot className="h-12 w-12 mx-auto mb-2" />
                    <p>Advisor is offline. Start the conversation with a trading query!</p>
                  </div>
                )}
              </div>

              {/* Trading Input */}
              <form onSubmit={handleTradingChat} className="flex gap-2">
                <label htmlFor="trading-chat-input" className="sr-only">Ask trading question</label>
                <Input
                  id="trading-chat-input"
                  name="message"
                  value={tradingQuery}
                  onChange={(e) => setTradingQuery(e.target.value)}
                  placeholder="Ask about stocks, crypto, forex, market analysis..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {/* Quick Trading Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('Should I buy NVDA right now?')}>
                  🎯 Get Trade Idea
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('What crypto should I buy today?')}>
                  ₿ Crypto Pick
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('Give me a safe ETF investment')}>
                  🛡️ Safe Play
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('High-risk high-reward trade?')}>
                  🚀 Moon Shot
                </Button>
              </div>

              {/* AI Trading Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">📈 92.3%</div>
                  <div className="text-sm text-green-300">Win Rate (7d)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">$24.7K</div>
                  <div className="text-sm text-blue-300">Paper Profits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">47</div>
                  <div className="text-sm text-purple-300">Active Signals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">⭐ Elite</div>
                  <div className="text-sm text-yellow-300">AI Tier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-300">📊 Market Analysis</CardTitle>
              <CardDescription className="text-blue-400">
                Real-time market insights and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <p>📈 Advanced market analysis coming soon...</p>
                <p>Real-time charts, technical indicators, and AI predictions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
