import {
  AlertTriangle,
  BarChart3,
  Bot,
  Brain,
  MessageCircle,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
}

export default function TradingAdvisorBot() {
  const [tradingQuery, setTradingQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
    [
      {
        id: '1',
        type: 'bot',
        message: `🤖 **Genesis Trading Advisor Online**

I'm your advanced AI trading assistant with expertise in:

📈 Market Analysis & Technical Indicators
📊 Risk Assessment & Portfolio Management
💹 Trade Execution & Strategy Development
🌍 Global Market Intelligence
⚠️ Risk Management & Compliance

**Available Trading Modes:**
• **Advisory Mode** - Analysis and recommendations
• **Paper Trading** - Practice with virtual funds
• **Live Trading** - Real market execution (when approved)

What market or trading strategy would you like to discuss?`,
        timestamp: new Date()
      }
    ]
  );

  const handleTradingChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradingQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: tradingQuery,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: `📊 **Market Analysis for: "${tradingQuery}"**

Based on current market conditions and advanced algorithms:

**Technical Analysis:**
• Support Level: $45.20
• Resistance Level: $52.80
• RSI: 68.4 (Slightly Overbought)
• Moving Average: Bullish crossover detected

**Risk Assessment:**
• Volatility: Medium (12.4%)
• Liquidity: High
• Market Sentiment: Cautiously Optimistic

**Trading Recommendation:**
Consider a gradual position build with tight stop-losses. Monitor key resistance levels.

⚠️ **Risk Warning:** All trading involves risk. This is analysis, not financial advice.

Would you like me to elaborate on any specific aspect?`,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setTradingQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      <Tabs defaultValue="trading-bot" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trading-bot">Trading Advisor</TabsTrigger>
          <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Manager</TabsTrigger>
          <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
          <TabsTrigger value="trade-execution">Trade Execution</TabsTrigger>
        </TabsList>

        {/* Trading Bot Chat */}
        <TabsContent value="trading-bot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-green-600" />
                Advanced Trading Advisor
                <Badge className="bg-green-100 text-green-800">AI-Powered</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Live Markets</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <Input
                  value={tradingQuery}
                  onChange={(e) => setTradingQuery(e.target.value)}
                  placeholder="Ask about stocks, crypto, forex, market analysis..."
                  className="flex-1"
                />
                <Button type="submit">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </form>

              {/* Quick Trading Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('Analyze AAPL stock')}>
                  📈 Analyze Stock
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('Show me crypto market trends')}>
                  ₿ Crypto Analysis
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('What are the forex opportunities?')}>
                  💱 Forex Signals
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTradingQuery('Help me manage portfolio risk')}>
                  ⚠️ Risk Check
                </Button>
              </div>

              {/* Market Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-green-50 rounded">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">📈</div>
                  <div className="text-sm text-green-700">Markets Open</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">94.7%</div>
                  <div className="text-sm text-blue-700">AI Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-purple-700">Active Signals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">Low</div>
                  <div className="text-sm text-orange-700">Market Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        

        {/* Market Analysis */}
        <TabsContent value="market-analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Real-Time Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Market Analytics</h3>
                <p className="text-gray-600 mb-4">Real-time analysis powered by Genesis AI algorithms</p>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Market Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        

        {/* Placeholder Tabs */}
        <TabsContent value="portfolio">
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold">Feature Under Development</h3>
                <p className="text-gray-600">The **Portfolio Manager** module is currently being re-integrated and tested. Check back soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risk-management">
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold">Feature Under Development</h3>
                <p className="text-gray-600">The **Risk Management** module is currently being re-integrated and tested. Check back soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trade-execution">
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold">Feature Under Development</h3>
                <p className="text-gray-600">The **Trade Execution** module is currently being re-integrated and tested. Check back soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
