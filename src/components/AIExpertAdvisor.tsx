// --- R.O.M.A.N. frontend event logging utility ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Brain, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
const romanSupabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
type RomanEvent = {
  actor?: string;
  action_type: string;
  context?: Record<string, any>;
  payload?: Record<string, any>;
  severity?: 'info' | 'warn' | 'error';
};
async function recordRomanEvent(e: RomanEvent) {
  try {
    await romanSupabase
      .from('ops.roman_events')
      .insert({
        actor: e.actor ?? 'roman',
        action_type: e.action_type,
        context: e.context ?? {},
        payload: e.payload ?? {},
        severity: e.severity ?? 'info',
      });
  } catch (error) {
    // Fail silently in UI
  }
}

interface AIExpertAdvisorProps {
  name?: string;
  specialty?: string;
  avatarUrl?: string;
  message?: string;
}

const defaultMessage = `Hello! I'm your AI Expert Advisor. I can provide insights, answer questions, and help you make smarter trading decisions. Ask me about market trends, trading strategies, or anything AI-related!`;


const AIExpertAdvisor: React.FC<AIExpertAdvisorProps> = ({
  name = 'Dr. Athena',
  specialty = 'AI & Quantitative Trading',
  avatarUrl,
  message = defaultMessage,
}) => {
  const [chat, setChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: message }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAIProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  // Connect to Google Gemini API
  const getGeminiResponse = async (userMsg: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // Gemini expects a different payload structure
    const systemPrompt = `You are Dr. Athena, an expert AI trading advisor. Give concise, actionable, and friendly advice about crypto trading, strategies, and market trends.`;
    const history = chat.filter(m => m.sender === 'user' || m.sender === 'ai').map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history,
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.7
        }
      })
    });
    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      return 'Sorry, I could not get a response from Gemini.';
    }
  };

  // Connect to OpenAI API
  const getOpenAIResponse = async (userMsg: string) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are Dr. Athena, an expert AI trading advisor. Give concise, actionable, and friendly advice about crypto trading, strategies, and market trends.` },
          ...chat.filter(m => m.sender === 'user' || m.sender === 'ai').map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: userMsg }
        ],
        max_tokens: 120,
        temperature: 0.7
      })
    });
    const data = await res.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    } else {
      return 'Sorry, I could not get a response from OpenAI.';
    }
  };

  // Connect to Anthropic Claude API
  const getAnthropicResponse = async (userMsg: string) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const systemPrompt = `You are Dr. Athena, an expert AI trading advisor. Give concise, actionable, and friendly advice about crypto trading, strategies, and market trends.`;
    const messages = [
      { role: 'user', content: userMsg }
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 120,
        system: systemPrompt,
        messages: [
          ...chat.filter(m => m.sender === 'user' || m.sender === 'ai').map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: userMsg }
        ]
      })
    });
    const data = await res.json();
    if (data.content && Array.isArray(data.content) && data.content[0]?.text) {
      return data.content[0].text.trim();
    } else {
      return 'Sorry, I could not get a response from Anthropic.';
    }
  };

  // Unified handler (calls Supabase Edge Function for secure AI proxy)
  const getAIResponse = async (userMsg: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          provider: aiProvider, // 'openai' | 'anthropic' | 'gemini'
          system: `You are Dr. Athena, an expert AI trading advisor. Give concise, actionable, and friendly advice about crypto trading, strategies, and market trends.`,
          messages: [
            ...chat.slice(-8).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: userMsg }
          ],
          max_tokens: 120,
          temperature: 0.7
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return `AI backend error: ${err}`
      }
      const data = await res.json()
      return data.text ?? 'No response.'
    } catch {
      return 'Error connecting to AI backend.'
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    // Log user message as event
    await recordRomanEvent({
      action_type: 'user_message',
      context: { component: 'AIExpertAdvisor', provider: aiProvider },
      payload: { text: userMsg },
      severity: 'info',
    });
    const aiMsg = await getAIResponse(userMsg);
    setChat(prev => [...prev, { sender: 'ai', text: aiMsg }]);
    // Log AI response as event
    await recordRomanEvent({
      action_type: 'ai_response',
      context: { component: 'AIExpertAdvisor', provider: aiProvider },
      payload: { text: aiMsg },
      severity: 'info',
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-100 border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full border-2 border-blue-300" />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-200">
            <Brain className="w-7 h-7 text-blue-700" />
          </div>
        )}
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {name} <Sparkles className="w-4 h-4 text-purple-500" />
          </CardTitle>
          <div className="text-xs text-blue-700 font-medium">{specialty}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-600">AI Provider:</span>
          <select
            className="rounded border border-blue-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={aiProvider}
            onChange={e => setAIProvider(e.target.value as 'openai' | 'anthropic' | 'gemini')}
            disabled={loading}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div className="max-h-40 overflow-y-auto mb-2 space-y-2">
          {chat.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'ai' ? 'text-blue-900' : 'text-right'}>
              <span className={msg.sender === 'ai' ? 'bg-blue-100 px-2 py-1 rounded-lg inline-block' : 'bg-purple-100 px-2 py-1 rounded-lg inline-block'}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            className="flex-1 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ask the AI advisor..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIExpertAdvisor;
