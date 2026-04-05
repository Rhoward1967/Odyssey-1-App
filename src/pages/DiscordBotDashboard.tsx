import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Circle, MessageSquare, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BotEvent {
  id: string;
  event_type: string;
  action_type: string;
  message: string;
  severity: string;
  created_at: string;
}

export default function DiscordBotDashboard() {
  const [events, setEvents] = useState<BotEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('system_events')
      .select('*')
      .or('action_type.ilike.discord%,event_type.ilike.discord%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      setEvents(data);
      setLastSeen(data[0].created_at);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    // Live updates
    const channel = supabase
      .channel('discord-bot-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'system_events',
      }, (payload) => {
        const row = payload.new as BotEvent;
        if (row.action_type?.startsWith('discord') || row.event_type?.startsWith('discord')) {
          setEvents(prev => [row, ...prev].slice(0, 50));
          setLastSeen(row.created_at);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Bot is "online" if it sent an event in the last 10 minutes
  const isOnline = lastSeen
    ? (Date.now() - new Date(lastSeen).getTime()) < 10 * 60 * 1000
    : false;

  const severityColor = (s: string) => {
    if (s === 'error') return 'text-red-400';
    if (s === 'warn') return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">R.O.M.A.N. Discord Bot</h1>
            <p className="text-sm text-slate-400">R.O.M.A.N. Assistant#1969</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEvents}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Circle
                className={`w-3 h-3 fill-current ${isOnline ? 'text-green-400' : 'text-red-400'}`}
              />
              <span className={`text-lg font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            {lastSeen && (
              <p className="text-xs text-slate-500 mt-1">
                Last seen: {new Date(lastSeen).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{events.length}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Last 50 Discord events</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-normal">AI Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold text-white">Ollama + Claude</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">llama3.2:1b (local) + Claude fallback</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Recent Bot Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No Discord events recorded yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Start the bot: <code className="text-purple-400">npm run bot</code>
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600/30"
                >
                  <Circle
                    className={`w-2 h-2 mt-1.5 fill-current shrink-0 ${severityColor(event.severity)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-500 text-slate-300"
                      >
                        {event.action_type || event.event_type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 break-words">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Start */}
      <Card className="bg-slate-800/50 border-slate-700 border-dashed">
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 font-mono">
            # Start the bot from your terminal:
          </p>
          <p className="text-sm text-purple-400 font-mono mt-1">npm run bot</p>
          <p className="text-xs text-slate-500 font-mono mt-2">
            # Or from dev-lab directly:
          </p>
          <p className="text-sm text-purple-400 font-mono mt-1">npx tsx F:\dev-lab\bot.ts</p>
        </CardContent>
      </Card>
    </div>
  );
}
