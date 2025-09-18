import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface OfflineData {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

interface OfflineSyncHook {
  isOnline: boolean;
  pendingSync: number;
  syncData: (table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => Promise<void>;
  forcSync: () => Promise<void>;
}

export function useOfflineSync(): OfflineSyncHook {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  const getOfflineData = (): OfflineData[] => {
    const stored = localStorage.getItem('odyssey_offline_data');
    return stored ? JSON.parse(stored) : [];
  };

  const setOfflineData = (data: OfflineData[]) => {
    localStorage.setItem('odyssey_offline_data', JSON.stringify(data));
    setPendingSync(data.length);
  };

  const syncData = useCallback(async (
    table: string, 
    action: 'INSERT' | 'UPDATE' | 'DELETE', 
    data: any
  ) => {
    if (isOnline) {
      try {
        if (action === 'INSERT') {
          await supabase.from(table).insert(data);
        } else if (action === 'UPDATE') {
          await supabase.from(table).update(data).eq('id', data.id);
        } else if (action === 'DELETE') {
          await supabase.from(table).delete().eq('id', data.id);
        }
      } catch (error) {
        // If sync fails, store for offline
        const offlineData = getOfflineData();
        offlineData.push({
          id: crypto.randomUUID(),
          table,
          action,
          data,
          timestamp: Date.now()
        });
        setOfflineData(offlineData);
      }
    } else {
      // Store for offline sync
      const offlineData = getOfflineData();
      offlineData.push({
        id: crypto.randomUUID(),
        table,
        action,
        data,
        timestamp: Date.now()
      });
      setOfflineData(offlineData);
    }
  }, [isOnline]);

  const forcSync = useCallback(async () => {
    if (!isOnline) return;

    const offlineData = getOfflineData();
    const successful: string[] = [];

    for (const item of offlineData) {
      try {
        if (item.action === 'INSERT') {
          await supabase.from(item.table).insert(item.data);
        } else if (item.action === 'UPDATE') {
          await supabase.from(item.table).update(item.data).eq('id', item.data.id);
        } else if (item.action === 'DELETE') {
          await supabase.from(item.table).delete().eq('id', item.data.id);
        }
        successful.push(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }

    // Remove successfully synced items
    const remaining = offlineData.filter(item => !successful.includes(item.id));
    setOfflineData(remaining);
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      forcSync();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    setPendingSync(getOfflineData().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forcSync]);

  return { isOnline, pendingSync, syncData, forcSync };
}