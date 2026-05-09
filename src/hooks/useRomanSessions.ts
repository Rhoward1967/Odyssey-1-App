import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface StoredMessage {
  id: string;
  session_id: string;
  role: 'user' | 'roman';
  content: string;
  created_at: string;
}

export function useRomanSessions() {
  const [sessions,          setSessions]          = useState<ChatSession[]>([]);
  const [currentSessionId,  setCurrentSessionId]  = useState<string | null>(null);
  const [sessionMessages,   setSessionMessages]   = useState<StoredMessage[]>([]);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSessions = useCallback(async (search: string = '') => {
    if (search.trim()) {
      const { data: matches } = await supabase
        .rpc('fn_roman_chat_search', { query: search.trim() });

      if (!matches || (matches as any[]).length === 0) {
        setSessions([]);
        return;
      }

      const ids = (matches as { session_id: string }[]).map(m => m.session_id);
      const { data } = await supabase
        .from('roman_chat_sessions')
        .select('id, title, created_at, updated_at, message_count')
        .in('id', ids)
        .order('updated_at', { ascending: false })
        .limit(50);
      setSessions((data as ChatSession[]) ?? []);
    } else {
      const { data } = await supabase
        .from('roman_chat_sessions')
        .select('id, title, created_at, updated_at, message_count')
        .order('updated_at', { ascending: false })
        .limit(50);
      setSessions((data as ChatSession[]) ?? []);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Debounced search re-fetch
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadSessions(searchQuery), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, loadSessions]);

  const createSession = useCallback(async (): Promise<string | null> => {
    const { data, error } = await supabase
      .from('roman_chat_sessions')
      .insert({ title: 'New Conversation' })
      .select('id')
      .single();

    if (error || !data) return null;
    const newId = (data as { id: string }).id;
    setCurrentSessionId(newId);
    setSessionMessages([]);
    loadSessions('');
    return newId;
  }, [loadSessions]);

  const loadMessages = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('roman_chat_messages')
      .select('id, session_id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setSessionMessages((data as StoredMessage[]) ?? []);
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await loadMessages(sessionId);
  }, [loadMessages]);

  const saveMessage = useCallback(async (
    sessionId: string,
    role: 'user' | 'roman',
    content: string,
  ) => {
    await supabase.from('roman_chat_messages').insert({ session_id: sessionId, role, content });
    // Refresh list after a short delay so the trigger has time to update updated_at
    setTimeout(() => loadSessions(searchQuery), 600);
  }, [searchQuery, loadSessions]);

  return {
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
  };
}
