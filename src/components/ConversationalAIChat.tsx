import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp?: Date;
}

export default function ConversationalAIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Add welcome message on load
  useEffect(() => {
    const welcomeMessages = [
      "Hey there! I'm your ODYSSEY-1 assistant. Think of me as your business buddy who just happens to be really good with data and tech stuff. What's going on?",
      "Hi! 👋 I'm here to help make your work easier. Whether you need help with scheduling, finances, or just want to brainstorm - I'm all ears. What's on your mind?",
      "Hello! I'm your ODYSSEY-1 AI, but you can just think of me as your helpful work partner. I'm here to make your day smoother. What can I help you with?",
      "Hey! Ready to tackle whatever's on your plate today? I'm here to help with anything from managing your business to answering questions. What's up?",
    ];

    setMessages([{
      role: 'assistant',
      content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError('');

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);

    try {
      // Call our enhanced conversational AI function
      const { data, error: apiError } = await supabase.functions.invoke('conversational-ai-chat', {
        body: {
          message: userMessage,
          personality: 'friendly_helper',
          context: 'business_assistant'
        }
      });

      if (apiError) throw apiError;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);

    } catch (err: any) {
      console.error('Chat error:', err);

      // Friendly fallback responses
      const fallbackResponses = [
        "Oops! I had a little hiccup there. Mind trying that again? I promise I'm usually more reliable than this! 😅",
        "Sorry about that - seems like I got distracted for a second. What were you asking about?",
        "Hmm, that didn't work quite right. Let me try to help you another way - what did you need?",
        "Technical glitch on my end! But I'm still here and ready to help. What can I do for you?",
      ];

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date()
      }]);

      setError('Had a small connection issue, but I\'m still here to help!');
    } finally {
      setIsLoading(false);
    }
  };  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <span>💬 Chat with ODYSSEY-1</span>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Your Business Assistant
          </Badge>
        </CardTitle>
        <p className="text-purple-100 text-sm">
          Ask me anything about your business, schedule, finances, or just chat!
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {error && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg border">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : msg.role === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              }`}>
                <div className="text-xs opacity-75 mb-1 font-medium">
                  {msg.role === 'user' ? 'You' : msg.role === 'error' ? '⚠️ Error' : '🤖 ODYSSEY-1'}
                </div>
                <div className="leading-relaxed">{msg.content}</div>
                {msg.timestamp && (
                  <div className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-sm shadow-sm">
                <div className="text-xs opacity-75 mb-1 font-medium">🤖 ODYSSEY-1</div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-500 text-sm">thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type anything - ask questions, get help, or just chat..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-6"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("How's my business doing today?")}
              className="text-xs"
            >
              💼 Business Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("What's on my schedule?")}
              className="text-xs"
            >
              📅 My Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Any financial insights for me?")}
              className="text-xs"
            >
              💰 Money Matters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Give me some business advice")}
              className="text-xs"
            >
              💡 Get Advice
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
            💬 I speak plain English, not tech jargon. Ask me anything!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
