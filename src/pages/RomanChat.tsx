import { Mic, MicOff, Send, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import SovereignSidebar from '@/components/SovereignSidebar';
import { useRomanSessions } from '@/hooks/useRomanSessions';
import { SovereignCoreOrchestrator } from '@/services/SovereignCoreOrchestrator';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  id: string;
  role: 'user' | 'roman';
  text: string;
  timestamp: Date;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const GREETING = 'The documented record confirms: I am R.O.M.A.N. — online, sovereign, and operational. Speak your command or type below.';

function chunkText(text: string, maxChars = 3800): string[] {
  const clean = text.replace(/[*#`|►•▪]/g, '').replace(/\n+/g, ' ').trim();
  if (clean.length <= maxChars) return [clean];
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if (current.length + s.length > maxChars && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export default function RomanChat() {
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState('');
  const [voiceState,    setVoiceState]    = useState<VoiceState>('idle');
  const [voiceEnabled,  setVoiceEnabled]  = useState(true);
  const [micAvailable]                    = useState(!!SpeechRecognition);
  const [error,         setError]         = useState<string | null>(null);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const chatBottomRef  = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const chatHistoryRef = useRef<{ type: string; message: string }[]>([]);

  const {
    sessions,
    currentSessionId,
    sessionMessages,
    searchQuery,
    sidebarOpen,
    setSidebarOpen,
    setSearchQuery,
    createSession,
    switchSession,
    saveMessage,
    deleteSession,
  } = useRomanSessions();

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // On mount: show greeting in UI only — no DB session yet.
  // The session is created lazily when the user sends their first message,
  // so opening the chat without typing doesn't pollute the sidebar.
  useEffect(() => {
    addMessage('roman', GREETING);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When the user switches to an existing session: load its messages into UI
  useEffect(() => {
    if (sessionMessages.length === 0) return;
    setMessages(sessionMessages.map(m => ({
      id:        m.id,
      role:      m.role,
      text:      m.content,
      timestamp: new Date(m.created_at),
    })));
    chatHistoryRef.current = sessionMessages.slice(-10).map(m => ({
      type:    m.role === 'roman' ? 'assistant' : 'user',
      message: m.content,
    }));
  }, [sessionMessages]);

  function addMessage(role: 'user' | 'roman', text: string): string {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { id, role, text, timestamp: new Date() }]);
    return id;
  }

  // ─── Browser TTS fallback ────────────────────────────────────────────────────
  const speakBrowser = useCallback((text: string) => {
    if (!window.speechSynthesis) { setVoiceState('idle'); return; }
    window.speechSynthesis.cancel();
    const chunks = chunkText(text, 3000);
    const voices = window.speechSynthesis.getVoices();
    const deep   = voices.find(v => /david|mark|guy|male/i.test(v.name)) ?? voices[0];

    let idx = 0;
    function speakNext() {
      if (idx >= chunks.length) { setVoiceState('idle'); return; }
      const utt = new SpeechSynthesisUtterance(chunks[idx++]);
      utt.rate = 0.92; utt.pitch = 0.85;
      if (deep) utt.voice = deep;
      utt.onend   = speakNext;
      utt.onerror = () => setVoiceState('idle');
      window.speechSynthesis.speak(utt);
    }
    setVoiceState('speaking');
    speakNext();
  }, []);

  // ─── TTS via roman-tts edge function (chunked for long text) ─────────────────
  const speakResponse = useCallback(async (text: string) => {
    setVoiceState('speaking');
    const chunks = chunkText(text);
    try {
      for (let i = 0; i < chunks.length; i++) {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roman-tts`;
        const ttsRes = await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text: chunks[i] }),
        });

        if (!ttsRes.ok) throw new Error(`TTS ${ttsRes.status}`);
        const data = await ttsRes.arrayBuffer();
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url  = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(url); reject(); };
          audio.play().catch(reject);
        });
      }
      setVoiceState('idle');
    } catch {
      speakBrowser(text);
    }
  }, [speakBrowser]);

  // ─── Send message to R.O.M.A.N. ─────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || voiceState === 'thinking') return;
    setError(null);

    // Lazily create the DB session on first user message,
    // and backfill the greeting that's already on screen.
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createSession();
      if (!activeSessionId) {
        setError('Could not start a conversation. Please try again.');
        return;
      }
      saveMessage(activeSessionId, 'roman', GREETING);
    }

    addMessage('user', text);
    saveMessage(activeSessionId, 'user', text);
    chatHistoryRef.current = [...chatHistoryRef.current, { type: 'user', message: text }];
    setInput('');

    // ── COMMAND EXECUTION — two-factor: "/do <cmd>" proposes, "confirm" executes ──
    // Awaiting confirmation of a previously-proposed command?
    if (pendingCommand !== null) {
      const cmd = pendingCommand;
      setPendingCommand(null);
      if (text.trim().toLowerCase() !== 'confirm') {
        const msg = 'Command cancelled — nothing was executed.';
        addMessage('roman', msg); saveMessage(activeSessionId, 'roman', msg);
        setVoiceState('idle');
        return;
      }
      setVoiceState('thinking');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const result: any = await SovereignCoreOrchestrator.processIntent(cmd, user?.id ?? '', 1);
        const summary = (result && (result.message || result.summary))
          ? (result.message || result.summary)
          : JSON.stringify(result, null, 2);
        const msg = `Executed. Receipt:\n${summary}`;
        addMessage('roman', msg); saveMessage(activeSessionId, 'roman', msg);
      } catch (err: any) {
        addMessage('roman', `Execution failed: ${err.message}`);
      }
      setVoiceState('idle');
      return;
    }

    // New explicit command → PREVIEW and require confirmation (does NOT execute yet).
    if (text.trim().toLowerCase().startsWith('/do ')) {
      const cmd = text.trim().slice(4).trim();
      setPendingCommand(cmd);
      const msg = `Ready to EXECUTE against the live system:\n\n"${cmd}"\n\nThis can perform real actions (payroll, trades, email, data changes). Reply "confirm" to execute, or anything else to cancel.`;
      addMessage('roman', msg); saveMessage(activeSessionId, 'roman', msg);
      setVoiceState('idle');
      return;
    }

    // ── CONVERSATION (default) — talk only, no execution ──
    setVoiceState('thinking');
    try {
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anthropic-chat`;
      const fnRes = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message:     text,
          chatHistory: chatHistoryRef.current.slice(-10),
        }),
      });

      const payload = await fnRes.json();
      if (!fnRes.ok || payload.error) {
        throw new Error(payload.error || `HTTP ${fnRes.status}: ${fnRes.statusText}`);
      }
      const response: string = payload?.response ?? 'The audit trail returned no response.';

      addMessage('roman', response);
      saveMessage(activeSessionId, 'roman', response);
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
  }, [voiceState, voiceEnabled, currentSessionId, createSession, saveMessage, speakResponse, pendingCommand]);

  // ─── Sidebar: switch to an existing session ──────────────────────────────────
  const handleSelectSession = useCallback(async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    setMessages([]);
    chatHistoryRef.current = [];
    await switchSession(sessionId);
  }, [currentSessionId, switchSession]);

  // ─── Sidebar: start a new chat ───────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    const sessionId = await createSession();
    if (!sessionId) return;
    setMessages([]);
    chatHistoryRef.current = [];
    addMessage('roman', GREETING);
    saveMessage(sessionId, 'roman', GREETING);
  }, [createSession, saveMessage]);

  // ─── Sidebar: delete a session ───────────────────────────────────────────────
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const wasActive = sessionId === currentSessionId;
    const ok = await deleteSession(sessionId);
    if (!ok) return;
    if (wasActive) {
      // Active conversation was deleted — start a fresh one with the greeting.
      const newId = await createSession();
      if (!newId) return;
      setMessages([]);
      chatHistoryRef.current = [];
      addMessage('roman', GREETING);
      saveMessage(newId, 'roman', GREETING);
    }
  }, [currentSessionId, deleteSession, createSession, saveMessage]);

  // ─── Mic / Speech Recognition ────────────────────────────────────────────────
  function startListening() {
    if (!micAvailable || voiceState !== 'idle') return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang            = 'en-US';
    recognition.interimResults  = false;
    recognition.maxAlternatives = 1;

    let gotResult = false;

    recognition.onstart  = () => setVoiceState('listening');
    recognition.onresult = (e: any) => {
      gotResult = true;
      sendMessage(e.results[0][0].transcript);
    };
    recognition.onerror = () => setVoiceState('idle');
    recognition.onend   = () => {
      if (!gotResult) setVoiceState('idle');
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
    window.speechSynthesis?.cancel();
    if (audioRef.current) audioRef.current.pause();
    setVoiceState('idle');
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
    <div className="flex flex-row flex-1 overflow-hidden bg-slate-900">

      {/* ── Sidebar ── */}
      <SovereignSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

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
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'roman' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                {msg.role === 'roman'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-white" />
                }
              </div>

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

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to chat · /do <command> to execute"
              rows={1}
              disabled={voiceState === 'thinking' || voiceState === 'listening'}
              className="flex-1 bg-slate-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 max-h-32 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
            />

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
    </div>
  );
}
