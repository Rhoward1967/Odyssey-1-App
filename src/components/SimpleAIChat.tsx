import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { realOpenAIService } from '../services/realOpenAI';

export default function SimpleAIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState({ remainingBudget: 10, remainingRequests: 100, dailySpent: 0 });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError('');

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await realOpenAIService.processIntelligentQuery(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      // Update usage based on real response
      setUsage(prev => ({
        ...prev,
        dailySpent: prev.dailySpent + (response.tokens * 0.000002),
        remainingBudget: prev.remainingBudget - (response.tokens * 0.000002),
        remainingRequests: prev.remainingRequests - 1
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'error', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Thinking...</Badge>;
    if (usage.remainingBudget <= 0) return <Badge variant="destructive">Budget Exceeded</Badge>;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') return <Badge variant="destructive">No API Key</Badge>;
    return <Badge variant="default">Ready</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ODYSSEY-1 AI Chat</span>
          {getStatusBadge()}
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold">${usage.remainingBudget.toFixed(4)}</div>
            <div className="text-gray-500">Budget Left</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{usage.remainingRequests}</div>
            <div className="text-gray-500">Requests Left</div>
          </div>
          <div className="text-center">
            <div className="font-bold">${usage.dailySpent.toFixed(4)}</div>
            <div className="text-gray-500">Total Spent</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="h-96 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Start a conversation with ODYSSEY-1!
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : msg.role === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white text-gray-800 border'
              }`}>
                <div className="text-xs opacity-75 mb-1">
                  {msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'ODYSSEY-1'}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to ODYSSEY-1..."
            disabled={isLoading || usage.remainingBudget <= 0}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim() || usage.remainingBudget <= 0}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Type a message and press Enter or click Send. Make sure to configure your OpenAI API key in Settings.
        </div>
      </CardContent>
    </Card>
  );
}