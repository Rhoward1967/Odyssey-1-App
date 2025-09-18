import React, { useState } from 'react';
import { Search, Lightbulb, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AIResearchAssistant from '@/components/AIResearchAssistant';
import AIResearchUsageTracker from '@/components/AIResearchUsageTracker';

export default function AIResearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleUpgradeClick = () => {
    setShowUpgrade(true);
  };

  const handleQueryAttempt = async (): Promise<boolean> => {
    // This will be handled by the usage tracker
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Research Assistant</h1>
              <p className="text-gray-600">Intelligent research powered by advanced AI</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Lightbulb className="w-4 h-4 mr-1" />
            AI Enhanced
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Usage Tracker */}
          <AIResearchUsageTracker
            onUpgradeClick={handleUpgradeClick}
            onQueryAttempt={handleQueryAttempt}
          />

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Research Query</h2>
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask anything or search for information..."
              className="w-full text-lg p-4"
            />
          </div>

          {/* AI Research Assistant */}
          <div className="bg-white rounded-lg border shadow-sm">
            <AIResearchAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}