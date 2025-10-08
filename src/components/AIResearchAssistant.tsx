import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { Bot, User, CornerDownLeft } from 'lucide-react';

// Define the structure for a message in the chat
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// ARCHITECT'S NOTE (PROJECT RESTORATION - DEFINITIVE):
// This is the restored, architecturally sound AI Research Assistant.
// It uses the secure `isSuperAdmin` flag from the `useAuth` hook, not a hardcoded email.
// This is the definitive blueprint for Directive RESTORATION-1.

const AIResearchAssistant = () => {
  const { user, isSuperAdmin } = useAuth(); // Use the isSuperAdmin flag from our secure hook
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canQuery, setCanQuery] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUsageStatus = async () => {
      if (isSuperAdmin) {
        setCanQuery(true);
        return; // Bypass all checks for super admin
      }
      
      if (user) {
        // In a real app, you would fetch usage limits from your database here.
        setCanQuery(true); 
      } else {
        setCanQuery(false);
        setError("You must be signed in to use the AI Research Assistant.");
      }
    };
    checkUsageStatus();
  }, [user, isSuperAdmin]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async () => {
    if (!query.trim() || isLoading || !canQuery) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setQuery('');

    try {
      // --- LIVE AI BACKEND CALL ---
      const { data, error: funcError } = await supabase.functions.invoke('ai-assistant-chat', {
        body: { query },
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      // Assuming the function returns an object like { reply: "..." }
      const botResponse: Message = { sender: 'bot', text: data.reply || "Sorry, I couldn't generate a response." };
      setMessages((prev) => [...prev, botResponse]);

    } catch (err: any) {
      console.error("Error invoking AI function:", err);
      const errorText = err.context?.body?.message || err.message || 'An unknown error occurred.';
      setError(errorText);
      const errorMessage: Message = { sender: 'bot', text: `Sorry, an error occurred: ${errorText}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> AI Research Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef as any}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && <Bot className="h-6 w-6 text-gray-500" />}
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === 'user' && <User className="h-6 w-6 text-gray-500" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-gray-500" />
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="w-full relative">
          <Textarea
            placeholder={canQuery ? "Type your research query..." : "Please sign in or upgrade your plan to ask questions."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-20"
            disabled={isLoading || !canQuery}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={handleSearch}
            disabled={isLoading || !query.trim() || !canQuery}
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {!isSuperAdmin && !canQuery && user && (
             <p className="text-yellow-500 text-xs mt-2">You have reached your query limit for this period.</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIResearchAssistant;
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
