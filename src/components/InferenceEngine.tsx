import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabaseClient';

interface ResearchQuery {
  id: string;
  query: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'researching' | 'completed' | 'failed';
  confidence: number;
  findings?: string;
  answer?: string;
}

export const InferenceEngine: React.FC = () => {
  const [queries, setQueries] = useState<ResearchQuery[]>([
    {
      id: '1',
      query: 'Latest government procurement regulations',
      priority: 'high',
      status: 'pending',
      confidence: 0
    }
  ]);

  const [newQuery, setNewQuery] = useState('');
  const [activeAgents, setActiveAgents] = useState(3);
  const [researchCycles, setResearchCycles] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setResearchCycles(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const performRealResearch = async (query: ResearchQuery) => {
    setQueries(prev => prev.map(q => 
      q.id === query.id ? { ...q, status: 'researching', confidence: 10 } : q
    ));

    try {
      const { data, error } = await supabase.functions.invoke('tavily-research', {
        body: { 
          query: query.query,
          searchDepth: 'advanced',
          maxResults: 5
        }
      });

      if (error) throw error;

      setQueries(prev => prev.map(q => 
        q.id === query.id ? {
          ...q,
          status: 'completed',
          confidence: 95,
          answer: data.answer,
          findings: `Found ${data.results?.length || 0} relevant sources`
        } : q
      ));
    } catch (error) {
      setQueries(prev => prev.map(q => 
        q.id === query.id ? {
          ...q,
          status: 'failed',
          confidence: 0,
          findings: 'Research failed - check API configuration'
        } : q
      ));
    }
  };

  const addCustomQuery = () => {
    if (!newQuery.trim()) return;
    
    const query: ResearchQuery = {
      id: Date.now().toString(),
      query: newQuery,
      priority: 'medium',
      status: 'pending',
      confidence: 0
    };
    
    setQueries(prev => [...prev, query]);
    setNewQuery('');
    
    // Auto-start research
    setTimeout(() => performRealResearch(query), 500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'researching': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            Real-Time Research Engine (Tavily AI)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter research query..."
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomQuery()}
            />
            <Button onClick={addCustomQuery}>Research</Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeAgents}</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{researchCycles}</div>
              <div className="text-sm text-gray-600">Research Cycles</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {queries.filter(q => q.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {queries.map((query) => (
            <div key={query.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getPriorityColor(query.priority)}>
                  {query.priority} priority
                </Badge>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(query.status)}`}>
                    {query.status.toUpperCase()}
                  </span>
                  {query.status === 'pending' && (
                    <Button size="sm" onClick={() => performRealResearch(query)}>
                      Start Research
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-800 mb-3">{query.query}</p>
              
              {query.status === 'researching' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <Progress value={query.confidence} className="flex-1" />
                    <span className="text-sm font-medium">{Math.round(query.confidence)}%</span>
                  </div>
                </div>
              )}
              
              {query.answer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">AI Research Answer:</p>
                  <p className="text-sm text-blue-700">{query.answer}</p>
                </div>
              )}
              
              {query.findings && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded mt-2">
                  {query.findings}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};