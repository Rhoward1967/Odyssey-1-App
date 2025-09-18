import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Search, Sparkles, AlertTriangle, Crown } from 'lucide-react';

interface ResearchResult {
  id: string;
  query: string;
  result: string;
  created_at: string;
}

const TIER_LIMITS = {
  free: 5,
  basic: 100,
  pro: 500,
  ultimate: 10000
};

export default function AIResearchAssistant() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const [canQuery, setCanQuery] = useState(true);

  useEffect(() => {
    checkUsageStatus();
    fetchResults();
  }, []);

  const checkUsageStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's subscription tier
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const tier = subscription?.tier || 'free';

      // Get usage limits
      const { data: limits } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUsage({ ...limits, tier });
      setCanQuery(limits?.free_queries_remaining > 0);
    } catch (error) {
      console.error('Error checking usage:', error);
    }
  };
  const fetchResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ai_research_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setResults(data.map(item => ({
          id: item.id,
          query: item.query_text,
          result: item.response_text || 'Processing...',
          created_at: item.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || !canQuery) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call AI research function
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          message: query,
          context: 'research'
        }
      });

      if (error) throw error;

      // Track usage
      await supabase
        .from('ai_research_usage')
        .insert({
          user_id: user.id,
          query_text: query,
          response_text: data.response,
          response_tokens: data.tokens || 0,
          cost_usd: data.cost || 0
        });

      // Decrement usage limit
      await supabase
        .from('usage_limits')
        .update({ 
          free_queries_remaining: supabase.sql`free_queries_remaining - 1`
        })
        .eq('user_id', user.id);

      // Refresh data
      await checkUsageStatus();
      await fetchResults();
      setQuery('');

    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!usage) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            AI Research Assistant
            <Badge className={`${usage.tier === 'ultimate' ? 'bg-gold-500' : 'bg-blue-500'} text-white`}>
              {usage.tier?.charAt(0).toUpperCase() + usage.tier?.slice(1)} Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canQuery && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">Query limit reached</p>
              </div>
              <p className="text-red-600 text-sm mt-1">
                Upgrade your plan to continue using AI research
              </p>
              <Button size="sm" className="mt-2">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your research question..."
              className="flex-1"
              rows={3}
              disabled={!canQuery}
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim() || !canQuery}
              className="self-start"
            >
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Research</h4>
              {results.map((result) => (
                <div key={result.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-sm mb-2">{result.query}</div>
                  <div className="text-gray-700 text-sm">{result.result}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(result.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}