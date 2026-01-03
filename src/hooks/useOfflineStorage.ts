import { useEffect, useState } from 'react';

interface OfflineData {
  bids: any[];
  photos: any[];
  locations: any[];
  lastSync: number;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = async (key: string, data: any) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const timestamp = Date.now();
      const offlineItem = { ...data, timestamp, synced: false };
      
      const existing = localStorage.getItem(`offline_${key}`);
      let items = [];
      try {
        items = existing ? JSON.parse(existing) : [];
      } catch (parseError) {
        console.warn('Invalid JSON in localStorage, resetting:', parseError);
        items = [];
      }
      items.push(offlineItem);
      
      localStorage.setItem(`offline_${key}`, JSON.stringify(items));
      setPendingSync(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  };

  const getOfflineData = (key: string) => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return false;
    
    try {
      const keys = ['bids', 'photos', 'locations'];
      let syncCount = 0;
      
      for (const key of keys) {
        const items = getOfflineData(key);
        const unsynced = items.filter((item: any) => !item.synced);
        
        for (const item of unsynced) {
          // Simulate sync to backend
          await new Promise(resolve => setTimeout(resolve, 100));
          item.synced = true;
          syncCount++;
        }
        
        localStorage.setItem(`offline_${key}`, JSON.stringify(items));
      }
      
      setPendingSync(0);
      return syncCount > 0;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  };

  const clearSyncedData = () => {
    const keys = ['bids', 'photos', 'locations'];
    keys.forEach(key => {
      const items = getOfflineData(key);
      const unsynced = items.filter((item: any) => !item.synced);
      localStorage.setItem(`offline_${key}`, JSON.stringify(unsynced));
    });
  };

  return {
    isOnline,
    pendingSync,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    clearSyncedData
  };
};