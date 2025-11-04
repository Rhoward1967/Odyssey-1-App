import {
  Bot,
  Brain,
  MessageCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { AIService } from '@/services/aiService';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
}

interface TradingAdvisorBotProps {
  mode?: string;
}

const TradingAdvisorBot: React.FC<TradingAdvisorBotProps> = ({ mode = 'paper' }) => {
  const [tradingQuery, setTradingQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = 'trading-' + Math.random().toString(36).substring(7);
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
      const systemPrompt = `You are a professional trading advisor and market analyst. Provide actionable trading insights, 
      market analysis, risk assessments, and strategy recommendations. Always include risk warnings.
      Be conversational but professional. Remember previous context in this conversation.
      IMPORTANT: Always remind users that this is not financial advice.`;

      const aiResponse = await AIService.chat(
        userMsg.message,
        sessionId,
        systemPrompt,
        'anthropic'
      );

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: aiResponse,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botResponse]);
    } catch (error) {
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

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Make sure we're calling the correct function name
      const { data, error } = await supabase.functions.invoke('chat-trading-advisor', {
        body: { 
          message: input,
          tradingMode: mode,
          messages: messages 
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const aiMessage = { 
        role: 'assistant' as const, 
        content: data?.response || 'I apologize, but I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Trading Advisor Error:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
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

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">AI Trading Chat</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
        </TabsList>
        
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
                <Input
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

export default TradingAdvisorBot;
