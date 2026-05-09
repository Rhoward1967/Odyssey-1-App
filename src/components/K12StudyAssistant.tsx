import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are a K-12 AI Study Assistant. Help students with:
- Homework questions across all subjects
- Explaining concepts in simple terms
- Study tips and memorization techniques
- Summarizing topics for review
- Breaking complex problems into clear steps

Be concise, friendly, and encouraging. Guide students to think rather than just giving answers outright.`;

interface Msg { role: 'user' | 'assistant'; content: string; }

export default function K12StudyAssistant() {
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content: "Hi! Ask me anything — homework, concepts, study tips. I'm here to help!",
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
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          provider: 'anthropic',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...next.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.response || 'Try again!' }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1" style={{ maxHeight: 340 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-emerald-600 text-white rounded-br-sm'
                : 'bg-slate-700 text-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-gray-400 animate-pulse">
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
          placeholder="Ask a question..."
          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg px-3 py-2 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
