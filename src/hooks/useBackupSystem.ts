import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface BackupLog {
  id: string;
  backup_type: 'full' | 'incremental' | 'document';
  status: 'started' | 'completed' | 'failed';
  backup_path?: string;
  file_count: number;
  total_size: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export const useBackupSystem = () => {
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBackupLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBackupLogs(data || []);
    } catch (error) {
      console.error('Error fetching backup logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupType: 'full' | 'incremental' | 'document' = 'incremental') => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('automated-backup', {
        body: { 
          backupType,
          userId: user.user.id
        }
      });

      if (error) throw error;
      
      // Refresh backup logs
      await fetchBackupLogs();
      
      return data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const scheduleAutoBackup = (intervalHours: number = 24) => {
    // Schedule automatic backups
    const interval = setInterval(() => {
      createBackup('incremental').catch(console.error);
    }, intervalHours * 60 * 60 * 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchBackupLogs();
  }, []);

  return {
    backupLogs,
    loading,
    createBackup,
    scheduleAutoBackup,
    refetch: fetchBackupLogs
  };
};