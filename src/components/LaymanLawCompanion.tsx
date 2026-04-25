import { useState, useRef, useEffect } from 'react'
import { X, Send, BookOpen, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ key: string; topic: string }>
  guardrail?: boolean
}

const QUICK_QUESTIONS = [
  'How do I dispute an error on my credit report?',
  'What can I do if a debt collector keeps calling me?',
  'How long does a charge-off stay on my credit report?',
  'What is the statute of limitations on debt in Georgia?',
  'How do I file a CFPB complaint?',
]

interface Props {
  onClose: () => void
  initialQuestion?: string
}

export default function LaymanLawCompanion({ onClose, initialQuestion }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm R.O.M.A.N. — your legal literacy companion. I explain consumer protection law in plain English. Ask me anything about your rights with creditors, debt collectors, or credit reporting. What do you need to know?",
    },
  ])
  const [input, setInput] = useState(initialQuestion ?? '')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (initialQuestion) send(initialQuestion)
  }, [])

  async function send(text?: string) {
    const question = (text ?? input).trim()
    if (!question || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const history = messages.map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roman-companion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ message: question, chatHistory: history }),
        }
      )

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        guardrail: data.guardrail_triggered,
      }])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I ran into a connection issue. Please try again in a moment.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
              <span className="text-yellow-400 text-xs font-bold">R</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">R.O.M.A.N.</h2>
              <p className="text-xs text-gray-500">Legal Literacy Companion</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-white'
                  : 'bg-gray-800 border border-gray-700 text-gray-200'
              }`}>
                {msg.guardrail && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Redirected to verified statute</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Sources:
                    </p>
                    {msg.sources.map(s => (
                      <p key={s.key} className="text-xs text-yellow-500/70">{s.topic}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length === 1 && (
          <div className="px-5 pb-2">
            <p className="text-xs text-gray-500 mb-2">Common questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about your legal rights..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Legal education only — not legal advice. Consult an attorney for your specific situation.
          </p>
        </div>
      </div>
    </div>
  )
}
