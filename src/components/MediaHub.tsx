import { Brain, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const MediaHub: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'bot',
      message: '🤖 Hello! I\'m your Research & Collaboration Assistant. How can I help you today?'
    }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { 
      id: Date.now().toString(), 
      type: 'user' as const, 
      message: chatMessage 
    };
    
    const botResponse = { 
      id: (Date.now() + 1).toString(), 
      type: 'bot' as const, 
      message: `🔍 Research Analysis: "${chatMessage}" - I found relevant information and can help with document analysis, citations, and collaboration tools.` 
    };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setChatMessage('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center justify-center gap-3">
          <Brain className="h-8 w-8" />
          Media Collaboration Hub
          <Users className="h-8 w-8" />
        </h1>
        <p className="text-gray-600 mt-2">AI-powered research assistant for document analysis and collaboration</p>
      </div>

      <Card className="border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-6 w-6" />
            AI Research Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-2 mb-4 p-3 border rounded bg-gray-50">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about research, documents, or collaboration..."
              className="flex-1 p-3 border rounded-lg"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaHub;
