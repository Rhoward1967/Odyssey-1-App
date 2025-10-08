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
  ultimate: 10000,
};

export default function AIResearchAssistant() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const [canQuery, setCanQuery] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkUsageStatus();
    fetchResults();
  }, []);
  const [error, setError] = useState<string | null>(null);

  // Patched: Always allow queries for authenticated users (owner override)
  const checkUsageStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setAuthError('Please sign in to use AI Research Assistant');
        setCanQuery(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthError(null);

      // Check for super admin role (from user metadata or RLS claim)
      // Adjust this logic to match your actual RLS/role storage
      const isSuperAdmin =
        user.role === 'super_admin' ||
        user.app_metadata?.role === 'super_admin' ||
        (user.user_metadata && user.user_metadata.role === 'super_admin');

      if (isSuperAdmin) {
        setUsage({
          tier: 'super_admin',
          free_queries_remaining: Infinity,
          pro_queries_remaining: Infinity,
          ultimate_queries_remaining: Infinity,
        });
        setCanQuery(true);
        return;
      }

      // Fallback to original usage/tier logic for regular users
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        const tier = subscription?.tier || 'free';

        const { data: limits } = await supabase
          .from('usage_limits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUsage({
          ...limits,
          tier,
          free_queries_remaining: limits?.free_queries_remaining || 5,
        });
        setCanQuery((limits?.free_queries_remaining || 5) > 0);
      } catch (dbError) {
        console.log('Database tables not found, using defaults');
        setUsage({
          tier: 'free',
          free_queries_remaining: 5,
          pro_queries_remaining: 0,
          ultimate_queries_remaining: 0,
        });
        setCanQuery(true);
      }
    } catch (error) {
      console.error('Error checking usage:', error);
      setIsAuthenticated(false);
      setAuthError('Unable to check usage status. Please try again.');
      setCanQuery(false);
    }
  };
  const fetchResults = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data } = await supabase
          .from('ai_research_usage')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data) {
          setResults(
            data.map(item => ({
              id: item.id,
              query: item.query_text,
              result: item.response_text || 'Processing...',
              created_at: item.created_at,
            }))
          );
        }
      } catch (dbError) {
        console.log('Usage history table not found, starting fresh');
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || !canQuery) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!query.trim()) {
        setError('Please enter a question.');
        return;
      }
      setError(null);

      // Call AI research function
      const { data, error } = await supabase.functions.invoke(
        'ai-assistant-chat',
        {
          body: {
            message: query,
            context: 'research',
          },
        }
      );

      if (error) throw error;

      // Track usage
      await supabase.from('ai_research_usage').insert({
        user_id: user.id,
        query_text: query,
        response_text: data.response,
        response_tokens: data.tokens || 0,
        cost_usd: data.cost || 0,
      });

      // Decrement usage limit
      await supabase
        .from('usage_limits')
        .update({
          free_queries_remaining: Math.max(
            0,
            (usage?.free_queries_remaining || 1) - 1
          ),
        })
        .eq('user_id', user.id); // Refresh data
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
    return <div className='animate-pulse bg-gray-200 h-64 rounded-lg'></div>;
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='w-5 h-5' />
            AI Research Assistant
            <Badge
              className={`${usage.tier === 'ultimate' ? 'bg-gold-500' : 'bg-blue-500'} text-white`}
            >
              {usage.tier?.charAt(0).toUpperCase() + usage.tier?.slice(1)} Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Query limit warning removed: owner/unlimited mode */}

          <div className='flex gap-2'>
            <Textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && query.trim() && canQuery) {
                    handleSearch();
                  }
                }
              }}
              placeholder='Ask your research question...'
              className='flex-1'
              rows={3}
              disabled={!canQuery}
            />
            {error && <div className='text-red-500 text-sm mb-2'>{error}</div>}
            {/* Always show and enable the send button for super admins */}
            <Button
              onClick={handleSearch}
              disabled={(() => {
                // If super admin, never disable
                if (usage && usage.tier === 'super_admin') return false;
                return loading || !query.trim() || !canQuery;
              })()}
              className='self-start'
            >
              {loading ? (
                <div className='w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                <>
                  <Sparkles className='w-4 h-4 mr-2' />
                  Send
                </>
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Recent Research</h4>
              {results.map(result => (
                <div key={result.id} className='bg-gray-50 p-4 rounded-lg'>
                  <div className='font-medium text-sm mb-2'>{result.query}</div>
                  <div className='text-gray-700 text-sm'>{result.result}</div>
                  <div className='text-xs text-gray-500 mt-2'>
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
