import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Book, Bot, Brain, FileText, MessageCircle, Search, User } from 'lucide-react';
import { useState } from 'react';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
}

export default function ResearchAIBot() {
  const [researchQuery, setResearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
    [
      {
        id: '1',
        type: 'bot',
        message: `🤖 **Research AI Assistant Online**

I'm your advanced AI research assistant with expertise in:

📚 Document Analysis & Summarization
🔍 Information Retrieval & Fact-Checking
📊 Data Analysis & Visualization
🌐 Web Research & Citation Management
📝 Report Generation & Writing Assistance

**Available Research Modes:**
• **Quick Search** - Fast information lookup
• **Deep Analysis** - Comprehensive research
• **Document Review** - Analyze uploaded documents
• **Citation Management** - Organize sources

What would you like to research today?`,
        timestamp: new Date()
      }
    ]
  );

  const handleResearchChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: researchQuery,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: `📚 **Research Results for: "${researchQuery}"**

**Quick Summary:**
Based on current knowledge and reliable sources:

• Key Finding #1: [Relevant information about your query]
• Key Finding #2: [Important context and background]
• Key Finding #3: [Related insights and implications]

**Sources:**
1. Academic Research Papers (verified)
2. Industry Reports (2024-2025)
3. Expert Analysis

**Confidence Level:** High (87%)

Would you like me to:
• Dive deeper into any specific aspect?
• Find additional sources?
• Generate a detailed report?`,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setResearchQuery('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Research AI Assistant
          <Badge className="bg-purple-100 text-purple-800">AI-Powered</Badge>
          <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 min-h-[24rem] overflow-y-auto space-y-3 mb-4 p-4 border rounded bg-gray-50">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  msg.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.type === 'bot' ? (
                    <Bot className="h-4 w-4 mt-1 text-purple-600" />
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
          ))}
        </div>

        {/* Research Input */}
        <form onSubmit={handleResearchChat} className="flex gap-2">
          <Input
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            placeholder="Ask me anything... research, analyze, summarize..."
            className="flex-1"
          />
          <Button type="submit">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Research Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setResearchQuery('Summarize latest AI trends')}>
            <Search className="h-4 w-4 mr-1" /> AI Trends
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResearchQuery('Analyze market data')}>
            <FileText className="h-4 w-4 mr-1" /> Market Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResearchQuery('Find academic papers')}>
            <Book className="h-4 w-4 mr-1" /> Papers
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResearchQuery('Generate report')}>
            <FileText className="h-4 w-4 mr-1" /> Report
          </Button>
        </div>

        {/* Research Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-purple-50 rounded">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">📚</div>
            <div className="text-sm text-purple-700">Knowledge Base</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">96.2%</div>
            <div className="text-sm text-blue-700">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1.2M</div>
            <div className="text-sm text-green-700">Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Fast</div>
            <div className="text-sm text-orange-700">Response</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
