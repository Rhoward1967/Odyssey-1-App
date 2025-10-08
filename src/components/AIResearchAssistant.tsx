import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
        setError('You must be signed in to use the AI Research Assistant.');
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
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setQuery('');

    try {
      // --- LIVE AI BACKEND CALL ---
      const { data, error: funcError } = await supabase.functions.invoke(
        'ai-assistant-chat',
        {
          body: { query },
        }
      );

      if (funcError) {
        throw new Error(funcError.message);
      }

      // Assuming the function returns an object like { reply: "..." }
      const botResponse: Message = {
        sender: 'bot',
        text: data.reply || "Sorry, I couldn't generate a response.",
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err: any) {
      console.error('Error invoking AI function:', err);
      const errorText =
        err.context?.body?.message ||
        err.message ||
        'An unknown error occurred.';
      setError(errorText);
      const errorMessage: Message = {
        sender: 'bot',
        text: `Sorry, an error occurred: ${errorText}`,
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <Card className='w-full max-w-2xl mx-auto h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Bot /> AI Research Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow overflow-hidden'>
        <ScrollArea className='h-full pr-4' ref={scrollAreaRef as any}>
          <div className='space-y-4'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'bot' && (
                  <Bot className='h-6 w-6 text-gray-500' />
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <p className='text-sm whitespace-pre-wrap'>{msg.text}</p>
                </div>
                {msg.sender === 'user' && (
                  <User className='h-6 w-6 text-gray-500' />
                )}
              </div>
            ))}
            {isLoading && (
              <div className='flex items-start gap-3'>
                <Bot className='h-6 w-6 text-gray-500' />
                <div className='p-3 rounded-lg bg-gray-100 dark:bg-gray-800'>
                  <div className='flex items-center gap-2'>
                    <span className='h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-0'></span>
                    <span className='h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150'></span>
                    <span className='h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300'></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className='w-full relative'>
          <Textarea
            placeholder={
              canQuery
                ? 'Type your research query...'
                : 'Please sign in or upgrade your plan to ask questions.'
            }
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className='pr-20'
            disabled={isLoading || !canQuery}
          />
          <Button
            type='submit'
            size='icon'
            className='absolute top-1/2 right-3 -translate-y-1/2'
            onClick={handleSearch}
            disabled={isLoading || !query.trim() || !canQuery}
          >
            <CornerDownLeft className='h-4 w-4' />
          </Button>
          {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
          {!isSuperAdmin && !canQuery && user && (
            <p className='text-yellow-500 text-xs mt-2'>
              You have reached your query limit for this period.
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIResearchAssistant;
