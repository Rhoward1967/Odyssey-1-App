import { Brain, DollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const TradingHub: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'bot',
      message: '💹 Welcome to Genesis Trading AI! Ask me about market analysis, trading strategies, or portfolio management.'
    }
  ]);

  const handleAIChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = { 
      id: Date.now().toString(), 
      type: 'user' as const, 
      message: aiQuery 
    };
    
    const botResponse = { 
      id: (Date.now() + 1).toString(), 
      type: 'bot' as const, 
      message: `📊 Market Analysis: "${aiQuery}" - Based on current market data and technical indicators, here's my analysis with risk assessment and trading recommendations.` 
    };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setAiQuery('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-800 flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8" />
          Trading Platform
          <Brain className="h-8 w-8" />
        </h1>
        <p className="text-gray-600 mt-2">Professional trading AI advisor with market analysis and portfolio management</p>
      </div>

      {/* Portfolio Overview */}
      <Card className="border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-6 w-6" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">$200.00</div>
              <div className="text-sm text-green-700">Cash Balance</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$0.00</div>
              <div className="text-sm text-blue-700">Portfolio Value</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$200.00</div>
              <div className="text-sm text-purple-700">Total Value</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">$0.00</div>
              <div className="text-sm text-gray-700">Total P&L</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Trading Assistant */}
      <Card className="border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="h-6 w-6" />
            AI Trading Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-2 mb-4 p-3 border rounded bg-gray-50">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${msg.type === 'user' ? 'bg-green-600 text-white' : 'bg-white border'}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleAIChat} className="flex gap-2">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask about markets, stocks, trading strategies..."
              className="flex-1 p-3 border rounded-lg"
            />
            <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Send
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingHub;
