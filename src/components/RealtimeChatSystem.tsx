import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Users, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_role: string;
  created_at: string;
  channel: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export const RealtimeChatSystem: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChannels();
    loadMessages();
    subscribeToMessages();
    subscribeToPresence();
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannels = async () => {
    const defaultChannels = [
      { id: 'general', name: 'General', description: 'General discussion', member_count: 12 },
      { id: 'ai-research', name: 'AI Research', description: 'AI research discussions', member_count: 8 },
      { id: 'development', name: 'Development', description: 'Development updates', member_count: 5 }
    ];
    setChannels(defaultChannels);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', activeChannel)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        setMessages(data);
      } else {
        // Mock messages for demo
        const mockMessages: Message[] = [
          {
            id: '1',
            content: 'Welcome to the Odyssey-1 chat system!',
            user_id: 'system',
            user_name: 'System',
            user_role: 'system',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            channel: activeChannel
          },
          {
            id: '2',
            content: 'Real-time messaging is now active.',
            user_id: 'admin',
            user_name: 'Admin',
            user_role: 'admin',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            channel: activeChannel
          }
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${activeChannel}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.new.channel === activeChannel) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel(`presence:${activeChannel}`, {
      config: { presence: { key: user?.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(id => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            user_name: user?.name || user?.email,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Omit<Message, 'id'> = {
      content: newMessage,
      user_id: user.id,
      user_name: user.name || user.email || 'Anonymous',
      user_role: user.role || 'user',
      created_at: new Date().toISOString(),
      channel: activeChannel
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([message]);

      if (error) {
        // Fallback to local state for demo
        setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
      }
    } catch (error) {
      // Fallback to local state
      setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
    }

    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master': return 'bg-purple-500';
      case 'admin': return 'bg-red-500';
      case 'system': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Channels Sidebar */}
      <Card className="w-64 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="space-y-1 px-3">
            {channels.map(channel => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "default" : "ghost"}
                className="w-full justify-start h-auto p-2"
                onClick={() => setActiveChannel(channel.id)}
              >
                <div className="text-left">
                  <div className="font-medium"># {channel.name}</div>
                  <div className="text-xs opacity-70">{channel.member_count} members</div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-6 px-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Online ({onlineUsers.length})</span>
            </div>
            <div className="space-y-1">
              {onlineUsers.slice(0, 5).map(userId => (
                <div key={userId} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="truncate">User {userId.slice(-4)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span># {channels.find(c => c.id === activeChannel)?.name || activeChannel}</span>
            <Badge variant="secondary">{messages.length} messages</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map(message => (
                <div key={message.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full ${getRoleColor(message.user_role)} flex items-center justify-center text-white text-sm font-medium`}>
                    {message.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{message.user_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.user_role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={`Message #${activeChannel}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeChatSystem;