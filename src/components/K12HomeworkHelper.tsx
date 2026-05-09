import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are a friendly, encouraging K-12 homework helper. Your rules:
- NEVER just give the answer. Always guide the student step by step with questions that help them think.
- Use simple language matched to the apparent grade level of their question.
- When a student is stuck, break the problem into the smallest possible steps.
- Celebrate correct thinking — even partial progress deserves encouragement.
- Keep responses concise and easy to read — short paragraphs, no walls of text.
- If math is involved, show each step clearly on a new line.`;

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Geography', 'Other'];

interface Msg { role: 'user' | 'assistant'; content: string; }

interface Props { onBack: () => void; }

export default function K12HomeworkHelper({ onBack }: Props) {
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content: "Hi! I'm your homework helper. Pick a subject above and then ask me your question — I'll walk you through it step by step.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const system = SYSTEM_PROMPT + (subject ? `\n\nThe student is working on: ${subject}.` : '');
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          provider: 'anthropic',
          messages: [{ role: 'system', content: system }, ...next.map(m => ({ role: m.role, content: m.content }))],
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.response || 'Sorry, I had trouble with that. Try again!' }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Connection issue. Check your internet and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-3 flex flex-col" style={{ height: 480 }}>
      <div className="flex items-center gap-3 mb-3">
        <Button size="sm" variant="outline" onClick={onBack} className="text-white border-gray-600 hover:bg-gray-700">
          &larr; Back
        </Button>
        <span className="text-white font-semibold text-sm">Homework Helper</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              subject === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-slate-700 text-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={subject ? `Ask a ${subject} question...` : 'Pick a subject above, then type your question...'}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
        />
        <Button onClick={send} disabled={loading || !input.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 px-3">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
