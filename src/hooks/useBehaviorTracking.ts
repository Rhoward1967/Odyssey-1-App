import { supabase } from '@/lib/supabaseClient';
import { useEffect, useRef } from 'react';

export function useBehaviorTracking() {
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date>(new Date());

  useEffect(() => {
    initializeSession();
    trackPageView();
    
    const handleBeforeUnload = () => {
      updateSessionDuration();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const getSessionId = () => {
    if (!sessionIdRef.current && typeof window !== 'undefined') {
      sessionIdRef.current = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionIdRef.current);
    }
    return sessionIdRef.current || '';
  };

  const initializeSession = async () => {
    const sessionId = getSessionId();
    
    const { data: existing } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!existing) {
      await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          landing_page: window.location.href
        });
    }
  };

  const trackEvent = async (eventType: string, eventData?: any) => {
    const sessionId = getSessionId();
    
    await supabase
      .from('user_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href
      });
  };

  const trackPageView = () => {
    trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title
    });
  };

  const updateSessionDuration = async () => {
    const sessionId = getSessionId();
    const duration = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
    
    await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString(),
        duration_seconds: duration
      })
      .eq('session_id', sessionId);
  };

  return {
    trackEvent,
    trackPageView
  };
}