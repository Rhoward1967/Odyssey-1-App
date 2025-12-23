import { supabase } from '@/lib/supabaseClient';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

export function getCachedData(key: string): any | null {
  const entry = cache.get(key) as CacheEntry;
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Optimized query for employee list with minimal data
export async function getEmployeesOptimized() {
  const cacheKey = 'employees_list';
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return { success: true, employees: cached };
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, status, hourly_rate, position')
      .eq('status', 'active')
      .order('last_name');

    if (error) throw error;

    setCachedData(cacheKey, data);
    return { success: true, employees: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch employees' 
    };
  }
}

// Real-time subscription for time entries
export function subscribeToTimeEntries(callback: (entries: any[]) => void) {
  return supabase
    .channel('time_entries_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'time_entries' },
      () => {
        // Fetch updated data when changes occur
        supabase
          .from('time_entries')
          .select('*, employees!inner(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            if (data) callback(data);
          });
      }
    )
    .subscribe();
}
