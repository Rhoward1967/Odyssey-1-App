import { supabase } from '@/lib/supabaseClient';
import { Mic, MicOff, Send, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'roman';
  text: string;
  timestamp: Date;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

// ─── Browser Speech Recognition ──────────────────────────────────────────────
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function RomanChat() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [voiceState, setVoiceState]     = useState<VoiceState>('idle');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micAvailable]                  = useState(!!SpeechRecognition);
  const [error, setError]               = useState<string | null>(null);

  const chatBottomRef  = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const chatHistoryRef = useRef<{ type: string; message: string }[]>([]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Greet on first load
  useEffect(() => {
    addMessage('roman', 'The documented record confirms: I am R.O.M.A.N. — online, sovereign, and operational. Speak your command or type below.');
  }, []);

  function addMessage(role: 'user' | 'roman', text: string): string {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { id, role, text, timestamp: new Date() }]);
    return id;
  }

  // ─── Send message to R.O.M.A.N. ─────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || voiceState === 'thinking') return;
    setError(null);

    addMessage('user', text);
    chatHistoryRef.current = [...chatHistoryRef.current, { type: 'user', message: text }];
    setInput('');
    setVoiceState('thinking');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: text,
          chatHistory: chatHistoryRef.current.slice(-10), // last 10 turns
        },
      });

      if (fnError) throw new Error(fnError.message);
      const response: string = data?.response ?? 'The audit trail returned no response.';

      addMessage('roman', response);
      chatHistoryRef.current = [...chatHistoryRef.current, { type: 'assistant', message: response }];

      if (voiceEnabled) {
        await speakResponse(response);
      } else {
        setVoiceState('idle');
      }
    } catch (err: any) {
      setError(`Connection interrupted: ${err.message}`);
      setVoiceState('idle');
    }
  }, [voiceState, voiceEnabled]);

  // ─── TTS via roman-tts edge function ─────────────────────────────────────────
  async function speakResponse(text: string) {
    setVoiceState('speaking');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('roman-tts', {
        body: { text },
      });

      if (fnError) throw new Error(fnError.message);

      // data is an ArrayBuffer from the edge function
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const url  = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setVoiceState('idle');
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setVoiceState('idle');
      await audio.play();
    } catch {
      // TTS failed non-fatally — just show text
      setVoiceState('idle');
    }
  }

  // ─── Mic / Speech Recognition ────────────────────────────────────────────────
  function startListening() {
    if (!micAvailable || voiceState !== 'idle') return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart  = () => setVoiceState('listening');
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onerror  = () => setVoiceState('idle');
    recognition.onend    = () => {
      if (voiceState === 'listening') setVoiceState('idle');
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  }

  function toggleMic() {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'idle') {
      startListening();
    }
  }

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();
      setVoiceState('idle');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ─── Status label ─────────────────────────────────────────────────────────────
  const statusLabel = {
    idle:      '● Online',
    listening: '🎙 Listening...',
    thinking:  '⏳ Processing...',
    speaking:  '🔊 Speaking...',
  }[voiceState];

  const statusColor = {
    idle:      'text-green-400',
    listening: 'text-blue-400 animate-pulse',
    thinking:  'text-yellow-400 animate-pulse',
    speaking:  'text-purple-400 animate-pulse',
  }[voiceState];

  return (
    <div className="flex flex-col h-screen bg-slate-900 max-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">R.O.M.A.N.</h1>
            <p className="text-xs text-gray-400">Reasoning Operating Matrix with Autonomous Navigation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
          <button
            onClick={() => setVoiceEnabled(v => !v)}
            title={voiceEnabled ? 'Mute voice output' : 'Enable voice output'}
            className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'}`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'roman' ? 'bg-blue-600' : 'bg-slate-600'}`}>
              {msg.role === 'roman'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-white" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'roman'
                ? 'bg-slate-700 text-gray-100 rounded-tl-sm'
                : 'bg-blue-600 text-white rounded-tr-sm'
            }`}>
              {msg.text}
              <div className={`text-xs mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {voiceState === 'thinking' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">{error}</div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 shrink-0">
        {!micAvailable && (
          <p className="text-xs text-yellow-500 mb-2 text-center">
            Voice input requires Chrome or Edge browser.
          </p>
        )}
        <div className="flex gap-2 items-end">
          {/* Mic button */}
          <button
            onClick={voiceState === 'speaking' ? stopSpeaking : toggleMic}
            disabled={!micAvailable || voiceState === 'thinking'}
            className={`p-3 rounded-full shrink-0 transition-all ${
              voiceState === 'listening'
                ? 'bg-red-600 text-white animate-pulse scale-110'
                : voiceState === 'speaking'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={voiceState === 'listening' ? 'Stop listening' : voiceState === 'speaking' ? 'Stop speaking' : 'Start voice input'}
          >
            {voiceState === 'listening' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak your command or type here..."
            rows={1}
            disabled={voiceState === 'thinking' || voiceState === 'listening'}
            className="flex-1 bg-slate-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || voiceState === 'thinking' || voiceState === 'listening'}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
