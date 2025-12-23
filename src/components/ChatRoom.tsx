import { supabase } from '@/lib/supabaseClient';
import { useCallback, useEffect, useState } from 'react';

export function ChatRoom({ organizationId }: { organizationId: number }) {
  const [messages, setMessages] = useState([]);

  // Wrap loadMessages in useCallback to fix dependency warning
  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    setMessages(data || []);
  }, [organizationId]); // ← Add organizationId as dependency

  useEffect(() => {
    // Subscribe to organization's chat channel
    const channel = supabase
      .channel(`room:${organizationId}:messages`, {
        config: { private: true } // ← IMPORTANT for RLS
      })
      .on('broadcast', { event: '*' }, (payload) => {
        console.log('New message:', payload);
        // Update UI with new message
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    // Load existing messages
    loadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, loadMessages]); // ← Add loadMessages to dependency array

  async function sendMessage(content: string) {
    // Insert message (RLS automatically scopes to user's org)
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        organization_id: organizationId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) console.error('Send error:', error);
  }

  // ...existing code for UI...
}
