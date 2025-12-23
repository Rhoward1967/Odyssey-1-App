import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface ResearchResponse {
  success: boolean;
  answer?: string;
  results?: SearchResult[];
  query?: string;
  timestamp?: string;
  error?: string;
}

const TavilyResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchResponse | null>(null);
  const [searchDepth, setSearchDepth] = useState<'basic' | 'advanced'>('basic');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tavily-research', {
        body: {
          query: query.trim(),
          searchDepth,
          includeImages: false,
          maxResults: 5
        }
      });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        query
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Research Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Powered by Tavily's advanced search intelligence
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Research Query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your research question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={searchDepth === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchDepth('basic')}
              >
                Basic Search
              </Button>
              <Button
                variant={searchDepth === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchDepth('advanced')}
              >
                Advanced Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {results.success ? (
              <>
                {/* AI Answer */}
                {results.answer && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-900 leading-relaxed">{results.answer}</p>
                      {results.timestamp && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          {new Date(results.timestamp).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Search Results */}
                {results.results && results.results.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-900">Source Results</h3>
                    {results.results.map((result, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 flex-1">
                              {result.title}
                            </h4>
                            <Badge variant="secondary" className="ml-2">
                              Score: {(result.score * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {result.content}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Source
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Search Error</span>
                  </div>
                  <p className="text-red-700">{results.error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TavilyResearch;