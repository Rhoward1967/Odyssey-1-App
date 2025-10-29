import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Brain, MessageCircle, Bot, User, Users } from 'lucide-react';

const MediaCollaborationHub: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'bot',
      message: 'Hello! I\'m your Research & Collaboration Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: `I can help you with research and collaboration on: "${chatMessage}"`,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setChatMessage('');
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-green-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
            <Brain className="h-8 w-8 text-green-600" />
            Media Collaboration Hub
            <Users className="h-8 w-8 text-blue-600" />
          </CardTitle>
          <Badge className="mx-auto bg-blue-200 text-blue-800 text-lg px-4 py-2">
            AI-Powered Study & Research Platform
          </Badge>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            Research Assistant Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-3 mb-4 p-4 border rounded bg-gray-50">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.type === 'bot' ? (
                      <Bot className="h-4 w-4 mt-1 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 mt-1" />
                    )}
                    <div>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me about research, documents, or collaboration..."
              className="flex-1"
            />
            <Button type="submit">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaCollaborationHub;
