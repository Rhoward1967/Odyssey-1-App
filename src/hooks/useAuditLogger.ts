import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

interface AuditEvent {
  action: string;
  resource: string;
  details?: any;
}

export const useAuditLogger = () => {
  const [logging, setLogging] = useState(false);
  const { user } = useAuth();

  const logAction = async (event: AuditEvent) => {
    if (!user) return;

    setLogging(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-logger', {
        body: {
          userId: user.id,
          action: event.action,
          resource: event.resource,
          details: event.details,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        console.error('Audit logging failed:', error);
      }

      return data;
    } catch (error) {
      console.error('Audit logging error:', error);
    } finally {
      setLogging(false);
    }
  };

  const logBidAction = (action: string, bidId: string, details?: any) => {
    return logAction({
      action: `bid_${action}`,
      resource: `bid:${bidId}`,
      details
    });
  };

  const logUserAction = (action: string, targetUserId: string, details?: any) => {
    return logAction({
      action: `user_${action}`,
      resource: `user:${targetUserId}`,
      details
    });
  };

  const logSystemAction = (action: string, details?: any) => {
    return logAction({
      action: `system_${action}`,
      resource: 'system',
      details
    });
  };

  return {
    logAction,
    logBidAction,
    logUserAction,
    logSystemAction,
    logging
  };
};

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};