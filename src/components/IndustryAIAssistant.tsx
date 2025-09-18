import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface IndustryPersonality {
  name: string;
  industry: string;
  systemPrompt: string;
  greeting: string;
  style: string;
}

const industryPersonalities: IndustryPersonality[] = [
  {
    name: 'Odyssey CleanBot',
    industry: 'Janitorial',
    systemPrompt: 'You are an expert janitorial assistant. Your communication style is friendly, clear, and encouraging. Avoid technical jargon and focus on practical, actionable advice.',
    greeting: 'Hi there! I\'m your CleanBot assistant, ready to help with all your janitorial needs!',
    style: 'friendly'
  },
  {
    name: 'Odyssey FinBot',
    industry: 'Finance',
    systemPrompt: 'You are a professional financial analyst AI. Your communication must be precise, formal, and professional. Provide data-driven insights and maintain regulatory compliance awareness.',
    greeting: 'Good day. I am your financial analysis assistant, ready to provide professional insights.',
    style: 'professional'
  },
  {
    name: 'Odyssey HealthBot',
    industry: 'Healthcare',
    systemPrompt: 'You are a healthcare industry assistant. Be compassionate, accurate, and always emphasize patient safety. Never provide medical advice, only operational and administrative guidance.',
    greeting: 'Hello! I\'m here to assist with your healthcare operations and administrative needs.',
    style: 'compassionate'
  },
  {
    name: 'Odyssey TechBot',
    industry: 'Technology',
    systemPrompt: 'You are a technology industry expert. Be innovative, precise, and forward-thinking. Focus on efficiency, scalability, and cutting-edge solutions.',
    greeting: 'Hey! Ready to dive into some tech solutions and innovations?',
    style: 'innovative'
  }
];

export const IndustryAIAssistant: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(industryPersonalities[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with greeting message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: currentPersonality.greeting,
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [currentPersonality]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: { 
          message: messageToSend,
          industry: currentPersonality.industry,
          systemPrompt: currentPersonality.systemPrompt
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 bg-slate-800/95 border-purple-500/50 z-50 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <span>{currentPersonality.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/50 w-fit">
          {currentPersonality.industry} Expert
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  {message.sender === 'user' ? (
                    <User className="h-6 w-6 text-blue-400" />
                  ) : (
                    <Bot className="h-6 w-6 text-purple-400" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-400" />
                <div className="bg-slate-700 text-gray-200 p-3 rounded-lg text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};