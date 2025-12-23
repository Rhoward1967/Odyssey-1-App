import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

interface RealtimeDataHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date | null;
  refresh: () => void;
}

export function useRealtimeData<T>(
  tableName: string,
  filter?: { column: string; value: any }
): RealtimeDataHook<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');
      
      if (filter) {
        query = query.eq(filter.column, filter.value);
      }
      
      const { data: result, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setData(result || []);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [tableName, filter]);

  const refresh = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchInitialData();

    // Set up real-time subscription
    const channelName = filter 
      ? `${tableName}-${filter.column}-${filter.value}`
      : tableName;

    const realtimeChannel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
        },
        (payload) => {
          setLastUpdate(new Date());
          
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              (item as any).id === (payload.new as any).id ? payload.new as T : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => 
              (item as any).id !== (payload.old as any).id
            ));
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [tableName, filter, fetchInitialData]);

  return { data, loading, error, connected, lastUpdate, refresh };
}